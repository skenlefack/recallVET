const express = require('express');
const router = express.Router();
const db = require('../../../config/db');
const { logAudit } = require('../../../services/auditService');
const validate = require('../../../middleware/validate');
const asyncHandler = require('../../../utils/asyncHandler');
const { createEncounter, updateEncounter } = require('../../../validators/clinic');

const toMysqlDatetime = (v) => v ? new Date(v).toISOString().slice(0, 19).replace('T', ' ') : null;

// GET /api/v1/clinic/encounters
router.get('/', asyncHandler(async (req, res) => {
  const tenantId = req.tenant.id;
  const { animal_id, vet_user_id, status, case_status, date_from, date_to, page = 1, limit: rawLimit = 25 } = req.query;
  const limit = Math.min(parseInt(rawLimit) || 25, 100);
  const offset = (page - 1) * limit;
  let where = 'WHERE e.tenant_id = ?';
  const params = [tenantId];
  if (animal_id) { where += ' AND e.animal_id = ?'; params.push(animal_id); }
  if (vet_user_id) { where += ' AND e.vet_user_id = ?'; params.push(vet_user_id); }
  if (status) { where += ' AND e.status = ?'; params.push(status); }
  if (case_status) { where += ' AND e.case_status = ?'; params.push(case_status); }
  if (date_from) { where += ' AND e.encounter_date >= ?'; params.push(date_from); }
  if (date_to) { where += ' AND e.encounter_date <= ?'; params.push(date_to + ' 23:59:59'); }

  const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM rv_encounter e ${where}`, params);
  const [rows] = await db.query(
    `SELECT e.*, a.name as animal_name, a.animal_code, sp.name_fr as species_name,
            p.display_name as owner_name, u.username as vet_name
     FROM rv_encounter e
     LEFT JOIN rv_animal a ON e.animal_id = a.id LEFT JOIN rv_species sp ON a.species_id = sp.id
     LEFT JOIN rv_party p ON e.party_id = p.id LEFT JOIN users u ON e.vet_user_id = u.id
     ${where} ORDER BY e.encounter_date DESC LIMIT ? OFFSET ?`,
    [...params, limit, parseInt(offset)]
  );
  res.json({ success: true, data: rows, pagination: { total, page: parseInt(page), limit, totalPages: Math.ceil(total / limit) } });
}));

// GET /api/v1/clinic/encounters/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT e.*, a.name as animal_name, a.animal_code, a.species_id, sp.name_fr as species_name,
            a.weight_kg as animal_weight, a.date_of_birth, a.sex as animal_sex,
            p.display_name as owner_name, p.phone_primary as owner_phone,
            u.username as vet_name
     FROM rv_encounter e
     LEFT JOIN rv_animal a ON e.animal_id = a.id LEFT JOIN rv_species sp ON a.species_id = sp.id
     LEFT JOIN rv_party p ON e.party_id = p.id LEFT JOIN users u ON e.vet_user_id = u.id
     WHERE e.id = ? AND e.tenant_id = ?`, [req.params.id, req.tenant.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Encounter not found' });
  res.json({ success: true, data: rows[0] });
}));

// POST /api/v1/clinic/encounters
router.post('/', createEncounter, validate, asyncHandler(async (req, res) => {
  const tenantId = req.tenant.id;
  const b = req.body;

  const [result] = await db.query(
    `INSERT INTO rv_encounter (tenant_id, site_id, appointment_id, animal_id, party_id, vet_user_id,
      encounter_date, encounter_type, visit_reason, history_presenting_complaint, temperature_c,
      heart_rate_bpm, resp_rate_bpm, weight_kg, clinical_findings, diagnostic_hypotheses,
      primary_diagnosis_code, secondary_diagnosis_codes, procedures_performed, lab_tests_requested,
      prescription_needed, hospitalization_needed, surgery_needed, clinical_plan, follow_up_date,
      owner_instructions, case_status, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [tenantId, b.site_id || null, b.appointment_id || null, b.animal_id, b.party_id, b.vet_user_id,
      toMysqlDatetime(b.encounter_date || new Date().toISOString()), b.encounter_type || 'consultation',
      b.visit_reason || null, b.history_presenting_complaint || null, b.temperature_c || null,
      b.heart_rate_bpm || null, b.resp_rate_bpm || null, b.weight_kg || null,
      b.clinical_findings || null, b.diagnostic_hypotheses || null,
      b.primary_diagnosis_code || null,
      b.secondary_diagnosis_codes ? JSON.stringify(b.secondary_diagnosis_codes) : null,
      b.procedures_performed ? JSON.stringify(b.procedures_performed) : null,
      b.lab_tests_requested ? JSON.stringify(b.lab_tests_requested) : null,
      b.prescription_needed ? 1 : 0, b.hospitalization_needed ? 1 : 0, b.surgery_needed ? 1 : 0,
      b.clinical_plan || null, b.follow_up_date || null, b.owner_instructions || null,
      b.case_status || 'open', b.status || 'draft', req.user.id]
  );
  await logAudit(tenantId, req.user.id, 'encounter', result.insertId, 'create', null, b, req.ip);
  res.status(201).json({ success: true, data: { id: result.insertId } });
}));

// PUT /api/v1/clinic/encounters/:id
router.put('/:id', updateEncounter, validate, asyncHandler(async (req, res) => {
  const fields = ['site_id', 'encounter_type', 'visit_reason', 'history_presenting_complaint',
    'temperature_c', 'heart_rate_bpm', 'resp_rate_bpm', 'weight_kg', 'clinical_findings',
    'diagnostic_hypotheses', 'primary_diagnosis_code', 'prescription_needed',
    'hospitalization_needed', 'surgery_needed', 'clinical_plan', 'follow_up_date',
    'owner_instructions', 'case_status', 'status'];
  const jsonFields = ['secondary_diagnosis_codes', 'procedures_performed', 'lab_tests_requested'];
  const updates = []; const values = [];
  for (const f of fields) { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); } }
  for (const f of jsonFields) { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(JSON.stringify(req.body[f])); } }
  if (!updates.length) return res.status(400).json({ success: false, message: 'No fields to update' });
  values.push(req.params.id, req.tenant.id);
  const [result] = await db.query(`UPDATE rv_encounter SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`, values);
  if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Not found' });
  await logAudit(req.tenant.id, req.user.id, 'encounter', req.params.id, 'update', null, req.body, req.ip);
  res.json({ success: true, message: 'Updated' });
}));

// POST /api/v1/clinic/encounters/:id/sign
router.post('/:id/sign', asyncHandler(async (req, res) => {
  const [result] = await db.query(
    "UPDATE rv_encounter SET status = 'signed', signed_at = NOW(), signed_by = ? WHERE id = ? AND tenant_id = ? AND status IN ('draft','in_progress','completed')",
    [req.user.id, req.params.id, req.tenant.id]);
  if (!result.affectedRows) return res.status(400).json({ success: false, message: 'Cannot sign' });
  await logAudit(req.tenant.id, req.user.id, 'encounter', req.params.id, 'sign', null, { signed_by: req.user.id }, req.ip);
  res.json({ success: true, message: 'Signed' });
}));

module.exports = router;
