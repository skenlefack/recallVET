const express = require('express');
const router = express.Router();
const db = require('../../../config/db');
const { logAudit } = require('../../../services/auditService');
const asyncHandler = require('../../../utils/asyncHandler');

const toMysqlDatetime = (v) => v ? new Date(v).toISOString().slice(0, 19).replace('T', ' ') : null;

// GET /api/v1/clinic/hospitalizations
router.get('/', asyncHandler(async (req, res) => {
  const tenantId = req.tenant.id;
  const { animal_id, status, page = 1, limit: rawLimit = 25 } = req.query;
  const limit = Math.min(parseInt(rawLimit) || 25, 100);
  const offset = (page - 1) * limit;
  let where = 'WHERE h.tenant_id = ?';
  const params = [tenantId];
  if (animal_id) { where += ' AND h.animal_id = ?'; params.push(animal_id); }
  if (status) { where += ' AND h.status = ?'; params.push(status); }

  const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM rv_hospitalization h ${where}`, params);
  const [rows] = await db.query(
    `SELECT h.*, a.name as animal_name, a.animal_code,
            p.display_name as owner_name
     FROM rv_hospitalization h
     LEFT JOIN rv_animal a ON h.animal_id = a.id
     LEFT JOIN rv_party p ON a.owner_id = p.id
     ${where} ORDER BY h.admission_date DESC LIMIT ? OFFSET ?`,
    [...params, limit, parseInt(offset)]
  );
  res.json({ success: true, data: rows, pagination: { total, page: parseInt(page), limit, totalPages: Math.ceil(total / limit) } });
}));

// GET /api/v1/clinic/hospitalizations/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT h.*, a.name as animal_name, a.animal_code, sp.name_fr as species_name,
            a.weight_kg as animal_weight, a.date_of_birth, a.sex as animal_sex,
            p.display_name as owner_name, p.phone_primary as owner_phone
     FROM rv_hospitalization h
     LEFT JOIN rv_animal a ON h.animal_id = a.id LEFT JOIN rv_species sp ON a.species_id = sp.id
     LEFT JOIN rv_party p ON a.owner_id = p.id
     WHERE h.id = ? AND h.tenant_id = ?`, [req.params.id, req.tenant.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Hospitalisation non trouvée' });
  res.json({ success: true, data: rows[0] });
}));

// POST /api/v1/clinic/hospitalizations
router.post('/', asyncHandler(async (req, res) => {
  const tenantId = req.tenant.id;
  const b = req.body;
  if (!b.animal_id) return res.status(400).json({ success: false, message: 'animal_id est requis' });
  if (!b.reason) return res.status(400).json({ success: false, message: 'reason est requis' });

  const [result] = await db.query(
    `INSERT INTO rv_hospitalization (tenant_id, encounter_id, animal_id, cage_number, admission_date,
      reason, daily_notes, diet_instructions, medications, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [tenantId, b.encounter_id || null, b.animal_id, b.cage_number || null,
      toMysqlDatetime(b.admission_date || new Date().toISOString()),
      b.reason, b.daily_notes ? JSON.stringify(b.daily_notes) : null,
      b.diet_instructions || null, b.medications || null,
      b.status || 'admitted', req.user.id]
  );
  await logAudit(tenantId, req.user.id, 'hospitalization', result.insertId, 'create', null, b, req.ip);
  res.status(201).json({ success: true, data: { id: result.insertId } });
}));

// PUT /api/v1/clinic/hospitalizations/:id
router.put('/:id', asyncHandler(async (req, res) => {
  const fields = ['encounter_id', 'cage_number', 'reason', 'diet_instructions', 'medications', 'status'];
  const jsonFields = ['daily_notes'];
  const updates = []; const values = [];
  for (const f of fields) { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); } }
  for (const f of jsonFields) { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(JSON.stringify(req.body[f])); } }
  if (req.body.admission_date !== undefined) { updates.push('admission_date = ?'); values.push(toMysqlDatetime(req.body.admission_date)); }
  if (req.body.discharge_date !== undefined) { updates.push('discharge_date = ?'); values.push(toMysqlDatetime(req.body.discharge_date)); }
  if (!updates.length) return res.status(400).json({ success: false, message: 'Aucun champ à mettre à jour' });
  values.push(req.params.id, req.tenant.id);
  const [result] = await db.query(`UPDATE rv_hospitalization SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`, values);
  if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Non trouvé' });
  await logAudit(req.tenant.id, req.user.id, 'hospitalization', req.params.id, 'update', null, req.body, req.ip);
  res.json({ success: true, message: 'Mis à jour' });
}));

// POST /api/v1/clinic/hospitalizations/:id/discharge
router.post('/:id/discharge', asyncHandler(async (req, res) => {
  const [result] = await db.query(
    "UPDATE rv_hospitalization SET status = 'discharged', discharge_date = NOW() WHERE id = ? AND tenant_id = ? AND status = 'admitted'",
    [req.params.id, req.tenant.id]);
  if (!result.affectedRows) return res.status(400).json({ success: false, message: 'Impossible de donner congé' });
  await logAudit(req.tenant.id, req.user.id, 'hospitalization', req.params.id, 'discharge', null, { status: 'discharged' }, req.ip);
  res.json({ success: true, message: 'Patient sorti' });
}));

module.exports = router;
