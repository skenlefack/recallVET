const express = require('express');
const router = express.Router();
const db = require('../../../config/db');
const { logAudit } = require('../../../services/auditService');
const validate = require('../../../middleware/validate');
const asyncHandler = require('../../../utils/asyncHandler');
const { createVaccination, updateVaccination } = require('../../../validators/clinic');

const toMysqlDatetime = (v) => v ? new Date(v).toISOString().slice(0, 19).replace('T', ' ') : null;

// GET /api/v1/clinic/vaccinations
router.get('/', asyncHandler(async (req, res) => {
  const tenantId = req.tenant.id;
  const { animal_id, date_from, date_to, page = 1, limit: rawLimit = 25 } = req.query;
  const limit = Math.min(parseInt(rawLimit) || 25, 100);
  const offset = (page - 1) * limit;
  let where = 'WHERE v.tenant_id = ?';
  const params = [tenantId];
  if (animal_id) { where += ' AND v.animal_id = ?'; params.push(animal_id); }
  if (date_from) { where += ' AND v.vaccination_date >= ?'; params.push(date_from); }
  if (date_to) { where += ' AND v.vaccination_date <= ?'; params.push(date_to + ' 23:59:59'); }

  const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM rv_vaccination_event v ${where}`, params);
  const [rows] = await db.query(
    `SELECT v.*, a.name as animal_name, a.animal_code, sp.name_fr as species_name, u.username as vet_name
     FROM rv_vaccination_event v
     LEFT JOIN rv_animal a ON v.animal_id = a.id LEFT JOIN rv_species sp ON a.species_id = sp.id
     LEFT JOIN users u ON v.administered_by = u.id
     ${where} ORDER BY v.vaccination_date DESC LIMIT ? OFFSET ?`,
    [...params, limit, parseInt(offset)]
  );
  res.json({ success: true, data: rows, pagination: { total, page: parseInt(page), limit, totalPages: Math.ceil(total / limit) } });
}));

// GET /api/v1/clinic/vaccinations/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT v.*, a.name as animal_name, a.animal_code, u.username as vet_name
     FROM rv_vaccination_event v
     LEFT JOIN rv_animal a ON v.animal_id = a.id LEFT JOIN users u ON v.administered_by = u.id
     WHERE v.id = ? AND v.tenant_id = ?`, [req.params.id, req.tenant.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: rows[0] });
}));

// POST /api/v1/clinic/vaccinations
router.post('/', createVaccination, validate, asyncHandler(async (req, res) => {
  const b = req.body;
  const [result] = await db.query(
    `INSERT INTO rv_vaccination_event (tenant_id, encounter_id, animal_id, product_name, manufacturer,
      lot_number, batch_number, expiry_date, vaccination_date, dose_administered, route, injection_site,
      dose_number, next_due_date, adverse_event, adverse_event_notes, certificate_number, certificate_needed, administered_by, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.tenant.id, b.encounter_id || null, b.animal_id, b.product_name, b.manufacturer || null,
      b.lot_number || null, b.batch_number || null, b.expiry_date || null, toMysqlDatetime(b.vaccination_date),
      b.dose_administered || null, b.route || 'SC', b.injection_site || null,
      b.dose_number || 1, b.next_due_date || null, b.adverse_event ? 1 : 0,
      b.adverse_event_notes || null, b.certificate_number || null, b.certificate_needed ? 1 : 0,
      req.user.id, b.notes || null]
  );
  await logAudit(req.tenant.id, req.user.id, 'vaccination', result.insertId, 'create', null, b, req.ip);
  res.status(201).json({ success: true, data: { id: result.insertId } });
}));

// PUT /api/v1/clinic/vaccinations/:id
router.put('/:id', updateVaccination, validate, asyncHandler(async (req, res) => {
  const fields = ['product_name', 'manufacturer', 'lot_number', 'batch_number', 'expiry_date',
    'vaccination_date', 'dose_administered', 'route', 'injection_site', 'dose_number',
    'next_due_date', 'adverse_event', 'adverse_event_notes', 'certificate_number', 'certificate_needed', 'notes'];
  const updates = []; const values = [];
  for (const f of fields) { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); } }
  if (!updates.length) return res.status(400).json({ success: false, message: 'No fields' });
  values.push(req.params.id, req.tenant.id);
  const [result] = await db.query(`UPDATE rv_vaccination_event SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`, values);
  if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, message: 'Updated' });
}));

module.exports = router;
