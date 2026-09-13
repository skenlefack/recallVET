const express = require('express');
const router = express.Router();
const db = require('../../../config/db');
const { logAudit } = require('../../../services/auditService');
const validate = require('../../../middleware/validate');
const asyncHandler = require('../../../utils/asyncHandler');
const { createRetailSale } = require('../../../validators/pharmacy');

const toMysqlDatetime = (v) => v ? new Date(v).toISOString().slice(0, 19).replace('T', ' ') : null;

router.get('/', asyncHandler(async (req, res) => {
  const { date_from, date_to, status, page = 1, limit: rawLimit = 25 } = req.query;
  const limit = Math.min(parseInt(rawLimit) || 25, 100);
  const offset = (page - 1) * limit;
  let where = 'WHERE s.tenant_id = ?';
  const params = [req.tenant.id];
  if (date_from) { where += ' AND s.sale_date >= ?'; params.push(date_from); }
  if (date_to) { where += ' AND s.sale_date <= ?'; params.push(date_to + ' 23:59:59'); }
  if (status) { where += ' AND s.status = ?'; params.push(status); }
  const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM rv_retail_sale s ${where}`, params);
  const [rows] = await db.query(
    `SELECT s.*, p.display_name as party_name, u.username as sold_by_name
     FROM rv_retail_sale s LEFT JOIN rv_party p ON s.party_id = p.id LEFT JOIN users u ON s.sold_by = u.id
     ${where} ORDER BY s.sale_date DESC LIMIT ? OFFSET ?`,
    [...params, limit, parseInt(offset)]);
  res.json({ success: true, data: rows, pagination: { total, page: parseInt(page), limit, totalPages: Math.ceil(total / limit) } });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT * FROM rv_retail_sale WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenant.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
  const [lines] = await db.query(
    `SELECT sl.*, p.name as product_name FROM rv_retail_sale_line sl LEFT JOIN rv_product p ON sl.product_id = p.id WHERE sl.sale_id = ?`, [req.params.id]);
  res.json({ success: true, data: { ...rows[0], lines } });
}));

router.post('/', createRetailSale, validate, asyncHandler(async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const b = req.body;
    const [[{ cnt }]] = await conn.query('SELECT COUNT(*) as cnt FROM rv_retail_sale WHERE tenant_id = ?', [req.tenant.id]);
    const sale_number = `SALE-${String(cnt + 1).padStart(5, '0')}`;

    let subtotal = 0, discount_total = 0, tax_total = 0;
    if (b.lines) {
      for (const l of b.lines) {
        const qty = parseFloat(l.quantity) || 0;
        const price = parseFloat(l.unit_price) || 0;
        const disc = parseFloat(l.discount) || 0;
        const lineTotal = qty * price - disc;
        subtotal += qty * price;
        discount_total += disc;
      }
    }
    tax_total = parseFloat(b.tax_amount) || 0;
    const total_amount = subtotal - discount_total + tax_total;

    const [result] = await conn.query(
      `INSERT INTO rv_retail_sale (tenant_id, site_id, party_id, sale_number, sale_date, sold_by, subtotal, discount_amount, tax_amount, total_amount, payment_method, payment_reference, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.tenant.id, b.site_id || null, b.party_id || null, sale_number,
        toMysqlDatetime(b.sale_date || new Date().toISOString()), req.user.id, subtotal, discount_total, tax_total, total_amount,
        b.payment_method || 'cash', b.payment_reference || null, b.notes || null]);
    const saleId = result.insertId;

    if (b.lines) {
      for (const l of b.lines) {
        const qty = parseFloat(l.quantity) || 0;
        const price = parseFloat(l.unit_price) || 0;
        const disc = parseFloat(l.discount) || 0;
        const line_total = qty * price - disc;

        await conn.query(
          'INSERT INTO rv_retail_sale_line (sale_id, product_id, lot_id, quantity, unit_price, discount, line_total) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [saleId, l.product_id, l.lot_id || null, qty, price, disc, line_total]);

        // Decrement stock
        if (l.lot_id) {
          const [lots] = await conn.query('SELECT * FROM rv_stock_lot WHERE id = ? FOR UPDATE', [l.lot_id]);
          if (lots.length && lots[0].quantity_on_hand >= qty) {
            await conn.query('UPDATE rv_stock_lot SET quantity_on_hand = quantity_on_hand - ? WHERE id = ?', [qty, l.lot_id]);
            await conn.query(
              `INSERT INTO rv_stock_movement (tenant_id, product_id, lot_id, from_location_id, movement_type, quantity, reference_type, reference_id, performed_by)
               VALUES (?, ?, ?, ?, 'sale', ?, 'retail_sale', ?, ?)`,
              [req.tenant.id, l.product_id, l.lot_id, lots[0].location_id, qty, saleId, req.user.id]);
          }
        }
      }
    }

    await conn.commit();
    await logAudit(req.tenant.id, req.user.id, 'retail_sale', saleId, 'create', null, b, req.ip);
    res.status(201).json({ success: true, data: { id: saleId, sale_number, total_amount } });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally { conn.release(); }
}));

router.post('/:id/void', asyncHandler(async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [sale] = await conn.query("SELECT * FROM rv_retail_sale WHERE id = ? AND tenant_id = ? AND status = 'completed'", [req.params.id, req.tenant.id]);
    if (!sale.length) { await conn.rollback(); return res.status(400).json({ success: false, message: 'Cannot void' }); }

    // Reverse stock movements
    const [lines] = await conn.query('SELECT * FROM rv_retail_sale_line WHERE sale_id = ?', [req.params.id]);
    for (const l of lines) {
      if (l.lot_id) {
        await conn.query('UPDATE rv_stock_lot SET quantity_on_hand = quantity_on_hand + ? WHERE id = ?', [l.quantity, l.lot_id]);
        await conn.query(
          `INSERT INTO rv_stock_movement (tenant_id, product_id, lot_id, to_location_id, movement_type, quantity, reference_type, reference_id, reason, performed_by)
           VALUES (?, ?, ?, (SELECT location_id FROM rv_stock_lot WHERE id = ?), 'return', ?, 'retail_sale_void', ?, 'Sale voided', ?)`,
          [req.tenant.id, l.product_id, l.lot_id, l.lot_id, l.quantity, req.params.id, req.user.id]);
      }
    }
    await conn.query("UPDATE rv_retail_sale SET status = 'voided' WHERE id = ?", [req.params.id]);
    await conn.commit();
    res.json({ success: true, message: 'Sale voided' });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally { conn.release(); }
}));

module.exports = router;
