const express = require('express');
const router = express.Router();
const db = require('../../../config/db');
const { logAudit } = require('../../../services/auditService');
const validate = require('../../../middleware/validate');
const asyncHandler = require('../../../utils/asyncHandler');
const { createPurchaseOrder } = require('../../../validators/pharmacy');

router.get('/', asyncHandler(async (req, res) => {
  const { status, supplier_id, page = 1, limit: rawLimit = 25 } = req.query;
  const limit = Math.min(parseInt(rawLimit) || 25, 100);
  const offset = (page - 1) * limit;
  let where = 'WHERE po.tenant_id = ?';
  const params = [req.tenant.id];
  if (status) { where += ' AND po.status = ?'; params.push(status); }
  if (supplier_id) { where += ' AND po.supplier_id = ?'; params.push(supplier_id); }
  const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM rv_purchase_order po ${where}`, params);
  const [rows] = await db.query(
    `SELECT po.*, s.name as supplier_name FROM rv_purchase_order po LEFT JOIN rv_supplier s ON po.supplier_id = s.id
     ${where} ORDER BY po.order_date DESC LIMIT ? OFFSET ?`,
    [...params, limit, parseInt(offset)]);
  res.json({ success: true, data: rows, pagination: { total, page: parseInt(page), limit, totalPages: Math.ceil(total / limit) } });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT po.*, s.name as supplier_name FROM rv_purchase_order po LEFT JOIN rv_supplier s ON po.supplier_id = s.id
     WHERE po.id = ? AND po.tenant_id = ?`, [req.params.id, req.tenant.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
  const [lines] = await db.query(
    `SELECT pol.*, p.name as product_name, p.sku FROM rv_purchase_order_line pol LEFT JOIN rv_product p ON pol.product_id = p.id WHERE pol.po_id = ?`, [req.params.id]);
  res.json({ success: true, data: { ...rows[0], lines } });
}));

router.post('/', createPurchaseOrder, validate, asyncHandler(async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const b = req.body;
    const [[{ cnt }]] = await conn.query('SELECT COUNT(*) as cnt FROM rv_purchase_order WHERE tenant_id = ?', [req.tenant.id]);
    const po_number = `PO-${String(cnt + 1).padStart(5, '0')}`;
    let total_amount = 0;
    if (b.lines) { for (const l of b.lines) total_amount += (parseFloat(l.quantity_ordered) || 0) * (parseFloat(l.unit_cost) || 0); }

    const [result] = await conn.query(
      `INSERT INTO rv_purchase_order (tenant_id, supplier_id, po_number, order_date, expected_delivery_date, total_amount, currency, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.tenant.id, b.supplier_id, po_number, b.order_date || new Date().toISOString().split('T')[0],
        b.expected_delivery_date || null, total_amount, b.currency || req.tenant.currency, b.notes || null, req.user.id]);
    const poId = result.insertId;
    if (b.lines) {
      for (const l of b.lines) {
        await conn.query('INSERT INTO rv_purchase_order_line (po_id, product_id, quantity_ordered, unit_cost) VALUES (?, ?, ?, ?)',
          [poId, l.product_id, l.quantity_ordered, l.unit_cost || 0]);
      }
    }
    await conn.commit();
    await logAudit(req.tenant.id, req.user.id, 'purchase_order', poId, 'create', null, b, req.ip);
    res.status(201).json({ success: true, data: { id: poId, po_number } });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally { conn.release(); }
}));

router.post('/:id/submit', asyncHandler(async (req, res) => {
  const [r] = await db.query("UPDATE rv_purchase_order SET status = 'submitted' WHERE id = ? AND tenant_id = ? AND status = 'draft'", [req.params.id, req.tenant.id]);
  if (!r.affectedRows) return res.status(400).json({ success: false, message: 'Cannot submit' });
  res.json({ success: true, message: 'Submitted' });
}));

router.post('/:id/cancel', asyncHandler(async (req, res) => {
  await db.query("UPDATE rv_purchase_order SET status = 'cancelled' WHERE id = ? AND tenant_id = ?", [req.params.id, req.tenant.id]);
  res.json({ success: true, message: 'Cancelled' });
}));

module.exports = router;
