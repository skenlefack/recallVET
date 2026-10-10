const express = require('express');
const router = express.Router();
const db = require('../../../config/db');
const { logAudit } = require('../../../services/auditService');
const asyncHandler = require('../../../utils/asyncHandler');

// GET /api/v1/clinic/protocols
router.get('/', asyncHandler(async (req, res) => {
  const tenantId = req.tenant.id;
  const { page = 1, limit: rawLimit = 25 } = req.query;
  const limit = Math.min(parseInt(rawLimit) || 25, 100);
  const offset = (page - 1) * limit;

  const [[{ total }]] = await db.query(
    'SELECT COUNT(*) as total FROM rv_vaccination_protocol WHERE tenant_id = ? AND is_active = 1', [tenantId]);
  const [rows] = await db.query(
    `SELECT p.*, sp.name_fr as species_name
     FROM rv_vaccination_protocol p
     LEFT JOIN rv_species sp ON p.species_id = sp.id
     WHERE p.tenant_id = ? AND p.is_active = 1
     ORDER BY p.name ASC LIMIT ? OFFSET ?`,
    [tenantId, limit, parseInt(offset)]
  );
  res.json({ success: true, data: rows, pagination: { total, page: parseInt(page), limit, totalPages: Math.ceil(total / limit) } });
}));

// POST /api/v1/clinic/protocols
router.post('/', asyncHandler(async (req, res) => {
  const b = req.body;
  if (!b.name) return res.status(400).json({ success: false, message: 'name is required' });
  const [result] = await db.query(
    `INSERT INTO rv_vaccination_protocol (tenant_id, name, species_id, vaccine_type_id, dose_number, interval_days, age_start_weeks, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.tenant.id, b.name, b.species_id || null, b.vaccine_type_id || null,
     b.dose_number || 1, b.interval_days || 0, b.age_start_weeks || null, b.notes || null]
  );
  await logAudit(req.tenant.id, req.user.id, 'vaccination_protocol', result.insertId, 'create', null, b, req.ip);
  res.status(201).json({ success: true, data: { id: result.insertId } });
}));

// PUT /api/v1/clinic/protocols/:id
router.put('/:id', asyncHandler(async (req, res) => {
  const fields = ['name', 'species_id', 'vaccine_type_id', 'dose_number', 'interval_days', 'age_start_weeks', 'notes'];
  const updates = []; const values = [];
  for (const f of fields) { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); } }
  if (!updates.length) return res.status(400).json({ success: false, message: 'No fields' });
  values.push(req.params.id, req.tenant.id);
  const [result] = await db.query(`UPDATE rv_vaccination_protocol SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ? AND is_active = 1`, values);
  if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Not found' });
  await logAudit(req.tenant.id, req.user.id, 'vaccination_protocol', req.params.id, 'update', null, req.body, req.ip);
  res.json({ success: true, message: 'Updated' });
}));

// DELETE /api/v1/clinic/protocols/:id (soft delete)
router.delete('/:id', asyncHandler(async (req, res) => {
  const [result] = await db.query(
    'UPDATE rv_vaccination_protocol SET is_active = 0 WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenant.id]);
  if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Not found' });
  await logAudit(req.tenant.id, req.user.id, 'vaccination_protocol', req.params.id, 'delete', null, null, req.ip);
  res.json({ success: true, message: 'Deleted' });
}));

module.exports = router;
