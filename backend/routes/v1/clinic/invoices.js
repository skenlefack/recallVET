const express = require('express');
const router = express.Router();
const db = require('../../../config/db');
const { logAudit } = require('../../../services/auditService');
const validate = require('../../../middleware/validate');
const asyncHandler = require('../../../utils/asyncHandler');
const { createInvoice, updateInvoice, recordPayment } = require('../../../validators/clinic');

const toMysqlDatetime = (v) => v ? new Date(v).toISOString().slice(0, 19).replace('T', ' ') : null;

// GET /api/v1/clinic/invoices
router.get('/', asyncHandler(async (req, res) => {
  const { status, party_id, date_from, date_to, page = 1, limit: rawLimit = 25 } = req.query;
  const limit = Math.min(parseInt(rawLimit) || 25, 100);
  const offset = (page - 1) * limit;
  let where = 'WHERE i.tenant_id = ?';
  const params = [req.tenant.id];
  if (status) { where += ' AND i.status = ?'; params.push(status); }
  if (party_id) { where += ' AND i.party_id = ?'; params.push(party_id); }
  if (date_from) { where += ' AND i.invoice_date >= ?'; params.push(date_from); }
  if (date_to) { where += ' AND i.invoice_date <= ?'; params.push(date_to); }

  const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM rv_invoice i ${where}`, params);
  const [rows] = await db.query(
    `SELECT i.*, p.display_name as party_name
     FROM rv_invoice i LEFT JOIN rv_party p ON i.party_id = p.id
     ${where} ORDER BY i.invoice_date DESC LIMIT ? OFFSET ?`,
    [...params, limit, parseInt(offset)]
  );
  res.json({ success: true, data: rows, pagination: { total, page: parseInt(page), limit, totalPages: Math.ceil(total / limit) } });
}));

// GET /api/v1/clinic/invoices/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT i.*, p.display_name as party_name, p.phone_primary, p.email
     FROM rv_invoice i LEFT JOIN rv_party p ON i.party_id = p.id
     WHERE i.id = ? AND i.tenant_id = ?`, [req.params.id, req.tenant.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
  const [lines] = await db.query('SELECT * FROM rv_invoice_line WHERE invoice_id = ?', [req.params.id]);
  const [payments] = await db.query('SELECT * FROM rv_payment WHERE invoice_id = ? ORDER BY payment_date', [req.params.id]);
  res.json({ success: true, data: { ...rows[0], lines, payments } });
}));

// POST /api/v1/clinic/invoices
router.post('/', createInvoice, validate, asyncHandler(async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const b = req.body;

    const [[{ cnt }]] = await conn.query('SELECT COUNT(*) as cnt FROM rv_invoice WHERE tenant_id = ?', [req.tenant.id]);
    const invoice_number = `INV-${String(cnt + 1).padStart(5, '0')}`;

    // Calculate totals from lines
    let subtotal = 0, tax_amount = 0;
    if (b.lines) {
      for (const l of b.lines) {
        const qty = parseFloat(l.quantity) || 1;
        const price = parseFloat(l.unit_price) || 0;
        const disc = parseFloat(l.discount_percent) || 0;
        const tax = parseFloat(l.tax_rate) || 0;
        const lineSubtotal = qty * price * (1 - disc / 100);
        subtotal += lineSubtotal;
        tax_amount += lineSubtotal * tax / 100;
      }
    }
    const discount_amount = parseFloat(b.discount_amount) || 0;
    const total_amount = subtotal - discount_amount + tax_amount;

    const [result] = await conn.query(
      `INSERT INTO rv_invoice (tenant_id, site_id, party_id, animal_id, encounter_id, invoice_number, invoice_date, due_date, subtotal, discount_amount, tax_amount, total_amount, currency, status, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)`,
      [req.tenant.id, b.site_id || null, b.party_id, b.animal_id || null, b.encounter_id || null,
        invoice_number, b.invoice_date || new Date().toISOString().split('T')[0], b.due_date || null,
        subtotal, discount_amount, tax_amount, total_amount, b.currency || req.tenant.currency,
        b.notes || null, req.user.id]
    );
    const invId = result.insertId;

    if (b.lines) {
      for (const l of b.lines) {
        const qty = parseFloat(l.quantity) || 1;
        const price = parseFloat(l.unit_price) || 0;
        const disc = parseFloat(l.discount_percent) || 0;
        const tax = parseFloat(l.tax_rate) || 0;
        const line_total = qty * price * (1 - disc / 100) * (1 + tax / 100);
        await conn.query(
          `INSERT INTO rv_invoice_line (invoice_id, description, quantity, unit_price, discount_percent, tax_rate, line_total, reference_type, reference_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [invId, l.description, qty, price, disc, tax, line_total, l.reference_type || 'service', l.reference_id || null]
        );
      }
    }

    await conn.commit();
    await logAudit(req.tenant.id, req.user.id, 'invoice', invId, 'create', null, b, req.ip);
    res.status(201).json({ success: true, data: { id: invId, invoice_number } });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally { conn.release(); }
}));

// PUT /api/v1/clinic/invoices/:id
router.put('/:id', updateInvoice, validate, asyncHandler(async (req, res) => {
  const fields = ['status', 'due_date', 'discount_amount', 'notes'];
  const updates = []; const values = [];
  for (const f of fields) { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); } }
  if (!updates.length) return res.json({ success: true });
  values.push(req.params.id, req.tenant.id);
  await db.query(`UPDATE rv_invoice SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`, values);
  res.json({ success: true, message: 'Updated' });
}));

// POST /api/v1/clinic/invoices/:id/pay — record a payment
router.post('/:id/pay', recordPayment, validate, asyncHandler(async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const b = req.body;
    const [inv] = await conn.query('SELECT * FROM rv_invoice WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenant.id]);
    if (!inv.length) { await conn.rollback(); return res.status(404).json({ success: false, message: 'Not found' }); }

    await conn.query(
      `INSERT INTO rv_payment (tenant_id, invoice_id, amount, payment_method, payment_reference, payment_date, received_by, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.tenant.id, req.params.id, b.amount, b.payment_method || 'cash', b.payment_reference || null,
        toMysqlDatetime(b.payment_date || new Date().toISOString()), req.user.id, b.notes || null]
    );

    // Check total paid
    const [[{ total_paid }]] = await conn.query('SELECT COALESCE(SUM(amount),0) as total_paid FROM rv_payment WHERE invoice_id = ?', [req.params.id]);
    const newStatus = total_paid >= inv[0].total_amount ? 'paid' : 'partially_paid';
    await conn.query('UPDATE rv_invoice SET status = ? WHERE id = ?', [newStatus, req.params.id]);

    await conn.commit();
    res.json({ success: true, message: 'Payment recorded', data: { status: newStatus, total_paid } });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally { conn.release(); }
}));

module.exports = router;
