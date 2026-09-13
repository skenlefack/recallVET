const express = require('express');
const router = express.Router();
const db = require('../../../config/db');
const { logAudit } = require('../../../services/auditService');
const validate = require('../../../middleware/validate');
const asyncHandler = require('../../../utils/asyncHandler');
const { createSupplier, updateSupplier } = require('../../../validators/pharmacy');

router.get('/', asyncHandler(async (req, res) => {
  const { search, page = 1, limit: rawLimit = 25 } = req.query;
  const limit = Math.min(parseInt(rawLimit) || 25, 100);
  const offset = (page - 1) * limit;
  let where = 'WHERE tenant_id = ?';
  const params = [req.tenant.id];
  if (search) { where += ' AND (name LIKE ? OR contact_person LIKE ?)'; const s = `%${search}%`; params.push(s, s); }
  const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM rv_supplier ${where}`, params);
  const [rows] = await db.query(`SELECT * FROM rv_supplier ${where} ORDER BY name LIMIT ? OFFSET ?`, [...params, limit, parseInt(offset)]);
  res.json({ success: true, data: rows, pagination: { total, page: parseInt(page), limit, totalPages: Math.ceil(total / limit) } });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT * FROM rv_supplier WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenant.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: rows[0] });
}));

router.post('/', createSupplier, validate, asyncHandler(async (req, res) => {
  const b = req.body;
  const [result] = await db.query(
    `INSERT INTO rv_supplier (tenant_id, name, contact_person, email, phone, address_line, city, country_code, tax_id, payment_terms_days, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.tenant.id, b.name, b.contact_person || null, b.email || null, b.phone || null, b.address_line || null,
      b.city || null, b.country_code || 'CM', b.tax_id || null, b.payment_terms_days || 30, b.notes || null]
  );
  await logAudit(req.tenant.id, req.user.id, 'supplier', result.insertId, 'create', null, b, req.ip);
  res.status(201).json({ success: true, data: { id: result.insertId } });
}));

router.put('/:id', updateSupplier, validate, asyncHandler(async (req, res) => {
  const fields = ['name', 'contact_person', 'email', 'phone', 'address_line', 'city', 'country_code', 'tax_id', 'payment_terms_days', 'notes', 'is_active'];
  const updates = []; const values = [];
  for (const f of fields) { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); } }
  if (!updates.length) return res.json({ success: true });
  values.push(req.params.id, req.tenant.id);
  await db.query(`UPDATE rv_supplier SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`, values);
  res.json({ success: true, message: 'Updated' });
}));

module.exports = router;
