const express = require('express');
const router = express.Router();
const db = require('../../../config/db');
const { logAudit } = require('../../../services/auditService');
const validate = require('../../../middleware/validate');
const asyncHandler = require('../../../utils/asyncHandler');
const { createGoodsReceipt } = require('../../../validators/pharmacy');

router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit: rawLimit = 25 } = req.query;
  const limit = Math.min(parseInt(rawLimit) || 25, 100);
  const offset = (page - 1) * limit;
  const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM rv_goods_receipt WHERE tenant_id = ?', [req.tenant.id]);
  const [rows] = await db.query(
    `SELECT gr.*, s.name as supplier_name, po.po_number
     FROM rv_goods_receipt gr LEFT JOIN rv_supplier s ON gr.supplier_id = s.id LEFT JOIN rv_purchase_order po ON gr.po_id = po.id
     WHERE gr.tenant_id = ? ORDER BY gr.receipt_date DESC LIMIT ? OFFSET ?`,
    [req.tenant.id, limit, parseInt(offset)]);
  res.json({ success: true, data: rows, pagination: { total, page: parseInt(page), limit, totalPages: Math.ceil(total / limit) } });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT gr.*, s.name as supplier_name FROM rv_goods_receipt gr LEFT JOIN rv_supplier s ON gr.supplier_id = s.id
     WHERE gr.id = ? AND gr.tenant_id = ?`, [req.params.id, req.tenant.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
  const [lines] = await db.query(
    `SELECT grl.*, p.name as product_name FROM rv_goods_receipt_line grl LEFT JOIN rv_product p ON grl.product_id = p.id WHERE grl.receipt_id = ?`, [req.params.id]);
  res.json({ success: true, data: { ...rows[0], lines } });
}));

// POST / — create receipt, auto-create stock lots and movements
router.post('/', createGoodsReceipt, validate, asyncHandler(async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const b = req.body;
    const [[{ cnt }]] = await conn.query('SELECT COUNT(*) as cnt FROM rv_goods_receipt WHERE tenant_id = ?', [req.tenant.id]);
    const receipt_number = `GR-${String(cnt + 1).padStart(5, '0')}`;

    const [result] = await conn.query(
      `INSERT INTO rv_goods_receipt (tenant_id, po_id, supplier_id, receipt_number, receipt_date, received_by, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.tenant.id, b.po_id || null, b.supplier_id || null, receipt_number,
        b.receipt_date || new Date().toISOString().split('T')[0], req.user.id, b.notes || null]);
    const grId = result.insertId;

    if (b.lines && b.lines.length) {
      for (const l of b.lines) {
        // Insert receipt line
        await conn.query(
          'INSERT INTO rv_goods_receipt_line (receipt_id, product_id, lot_number, batch_number, expiry_date, quantity_received, unit_cost, location_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [grId, l.product_id, l.lot_number || null, l.batch_number || null, l.expiry_date || null, l.quantity_received, l.unit_cost || 0, l.location_id || null]);

        // Create stock lot
        if (l.location_id) {
          const [lotResult] = await conn.query(
            `INSERT INTO rv_stock_lot (tenant_id, product_id, location_id, lot_number, batch_number, expiry_date, quantity_on_hand, unit_cost, receipt_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.tenant.id, l.product_id, l.location_id, l.lot_number || null, l.batch_number || null,
              l.expiry_date || null, l.quantity_received, l.unit_cost || 0, grId]);

          // Create stock movement
          await conn.query(
            `INSERT INTO rv_stock_movement (tenant_id, product_id, lot_id, to_location_id, movement_type, quantity, reference_type, reference_id, performed_by)
             VALUES (?, ?, ?, ?, 'receipt', ?, 'goods_receipt', ?, ?)`,
            [req.tenant.id, l.product_id, lotResult.insertId, l.location_id, l.quantity_received, grId, req.user.id]);
        }

        // Update PO line received quantities if linked
        if (b.po_id && l.po_line_id) {
          await conn.query('UPDATE rv_purchase_order_line SET quantity_received = quantity_received + ? WHERE id = ?', [l.quantity_received, l.po_line_id]);
        }
      }

      // Update PO status if linked
      if (b.po_id) {
        const [poLines] = await conn.query('SELECT * FROM rv_purchase_order_line WHERE po_id = ?', [b.po_id]);
        const allReceived = poLines.every(pl => pl.quantity_received >= pl.quantity_ordered);
        const anyReceived = poLines.some(pl => pl.quantity_received > 0);
        const newStatus = allReceived ? 'received' : anyReceived ? 'partially_received' : 'submitted';
        await conn.query('UPDATE rv_purchase_order SET status = ? WHERE id = ?', [newStatus, b.po_id]);
      }
    }

    await conn.commit();
    await logAudit(req.tenant.id, req.user.id, 'goods_receipt', grId, 'create', null, b, req.ip);
    res.status(201).json({ success: true, data: { id: grId, receipt_number } });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally { conn.release(); }
}));

module.exports = router;
