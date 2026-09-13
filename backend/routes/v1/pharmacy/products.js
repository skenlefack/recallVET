const express = require('express');
const router = express.Router();
const db = require('../../../config/db');
const { logAudit } = require('../../../services/auditService');
const validate = require('../../../middleware/validate');
const asyncHandler = require('../../../utils/asyncHandler');
const { createProduct, updateProduct, createCategory } = require('../../../validators/pharmacy');

// GET /categories
router.get('/categories', asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT * FROM rv_product_category WHERE tenant_id = ? OR tenant_id IS NULL ORDER BY sort_order, name_fr', [req.tenant.id]);
  res.json({ success: true, data: rows });
}));

router.post('/categories', createCategory, validate, asyncHandler(async (req, res) => {
  const { name_fr, name_en, parent_id } = req.body;
  const [result] = await db.query('INSERT INTO rv_product_category (tenant_id, name_fr, name_en, parent_id) VALUES (?, ?, ?, ?)',
    [req.tenant.id, name_fr, name_en || null, parent_id || null]);
  res.status(201).json({ success: true, data: { id: result.insertId } });
}));

// GET /
router.get('/', asyncHandler(async (req, res) => {
  const { search, category_id, active, page = 1, limit: rawLimit = 25 } = req.query;
  const limit = Math.min(parseInt(rawLimit) || 25, 100);
  const offset = (page - 1) * limit;
  let where = 'WHERE p.tenant_id = ?';
  const params = [req.tenant.id];
  if (search) { where += ' AND (p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)'; const s = `%${search}%`; params.push(s, s, s); }
  if (category_id) { where += ' AND p.category_id = ?'; params.push(category_id); }
  if (active !== undefined) { where += ' AND p.is_active = ?'; params.push(active === 'true' ? 1 : 0); }

  const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM rv_product p ${where}`, params);
  const [rows] = await db.query(
    `SELECT p.*, c.name_fr as category_name,
            COALESCE((SELECT SUM(sl.quantity_on_hand) FROM rv_stock_lot sl WHERE sl.product_id = p.id AND sl.status = 'available'), 0) as total_stock
     FROM rv_product p LEFT JOIN rv_product_category c ON p.category_id = c.id
     ${where} ORDER BY p.name LIMIT ? OFFSET ?`,
    [...params, limit, parseInt(offset)]
  );
  res.json({ success: true, data: rows, pagination: { total, page: parseInt(page), limit, totalPages: Math.ceil(total / limit) } });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT p.*, c.name_fr as category_name FROM rv_product p LEFT JOIN rv_product_category c ON p.category_id = c.id
     WHERE p.id = ? AND p.tenant_id = ?`, [req.params.id, req.tenant.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
  const [suppliers] = await db.query(
    `SELECT ps.*, s.name as supplier_name FROM rv_product_supplier ps LEFT JOIN rv_supplier s ON ps.supplier_id = s.id WHERE ps.product_id = ?`, [req.params.id]);
  res.json({ success: true, data: { ...rows[0], suppliers } });
}));

router.post('/', createProduct, validate, asyncHandler(async (req, res) => {
  const b = req.body;
  const [result] = await db.query(
    `INSERT INTO rv_product (tenant_id, category_id, sku, barcode, name, generic_name, description, unit, unit_price, currency, vat_rate, is_prescription_only, is_vaccine, species_applicable, storage_conditions, reorder_level)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.tenant.id, b.category_id || null, b.sku || null, b.barcode || null, b.name, b.generic_name || null,
      b.description || null, b.unit || 'unit', b.unit_price || 0, b.currency || req.tenant.currency,
      b.vat_rate || 0, b.is_prescription_only ? 1 : 0, b.is_vaccine ? 1 : 0,
      b.species_applicable ? JSON.stringify(b.species_applicable) : null,
      b.storage_conditions || null, b.reorder_level || 0]
  );
  await logAudit(req.tenant.id, req.user.id, 'product', result.insertId, 'create', null, b, req.ip);
  res.status(201).json({ success: true, data: { id: result.insertId } });
}));

router.put('/:id', updateProduct, validate, asyncHandler(async (req, res) => {
  const fields = ['category_id', 'sku', 'barcode', 'name', 'generic_name', 'description', 'unit', 'unit_price', 'currency', 'vat_rate', 'is_prescription_only', 'is_vaccine', 'storage_conditions', 'reorder_level', 'is_active'];
  const updates = []; const values = [];
  for (const f of fields) { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); } }
  if (req.body.species_applicable !== undefined) { updates.push('species_applicable = ?'); values.push(JSON.stringify(req.body.species_applicable)); }
  if (!updates.length) return res.json({ success: true });
  values.push(req.params.id, req.tenant.id);
  await db.query(`UPDATE rv_product SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`, values);
  res.json({ success: true, message: 'Updated' });
}));

module.exports = router;
