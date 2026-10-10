const express = require('express');
const router = express.Router();
const db = require('../../../config/db');
const { logAudit } = require('../../../services/auditService');
const asyncHandler = require('../../../utils/asyncHandler');

const toMysqlDatetime = (v) => v ? new Date(v).toISOString().slice(0, 19).replace('T', ' ') : null;

// GET /api/v1/clinic/surgeries
router.get('/', asyncHandler(async (req, res) => {
  const tenantId = req.tenant.id;
  const { animal_id, status, surgeon_id, page = 1, limit: rawLimit = 25 } = req.query;
  const limit = Math.min(parseInt(rawLimit) || 25, 100);
  const offset = (page - 1) * limit;
  let where = 'WHERE s.tenant_id = ?';
  const params = [tenantId];
  if (animal_id) { where += ' AND s.animal_id = ?'; params.push(animal_id); }
  if (status) { where += ' AND s.status = ?'; params.push(status); }
  if (surgeon_id) { where += ' AND s.surgeon_id = ?'; params.push(surgeon_id); }

  const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM rv_surgery s ${where}`, params);
  const [rows] = await db.query(
    `SELECT s.*, a.name as animal_name, a.animal_code,
            p.display_name as owner_name,
            CONCAT(u.first_name, ' ', u.last_name) as surgeon_name,
            CONCAT(u2.first_name, ' ', u2.last_name) as assistant_name
     FROM rv_surgery s
     LEFT JOIN rv_animal a ON s.animal_id = a.id
     LEFT JOIN rv_party p ON a.owner_id = p.id
     LEFT JOIN rv_users u ON s.surgeon_id = u.id
     LEFT JOIN rv_users u2 ON s.assistant_id = u2.id
     ${where} ORDER BY s.scheduled_date DESC LIMIT ? OFFSET ?`,
    [...params, limit, parseInt(offset)]
  );
  res.json({ success: true, data: rows, pagination: { total, page: parseInt(page), limit, totalPages: Math.ceil(total / limit) } });
}));

// GET /api/v1/clinic/surgeries/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT s.*, a.name as animal_name, a.animal_code, sp.name_fr as species_name,
            a.weight_kg as animal_weight, a.date_of_birth, a.sex as animal_sex,
            p.display_name as owner_name, p.phone_primary as owner_phone,
            CONCAT(u.first_name, ' ', u.last_name) as surgeon_name,
            CONCAT(u2.first_name, ' ', u2.last_name) as assistant_name
     FROM rv_surgery s
     LEFT JOIN rv_animal a ON s.animal_id = a.id LEFT JOIN rv_species sp ON a.species_id = sp.id
     LEFT JOIN rv_party p ON a.owner_id = p.id
     LEFT JOIN rv_users u ON s.surgeon_id = u.id
     LEFT JOIN rv_users u2 ON s.assistant_id = u2.id
     WHERE s.id = ? AND s.tenant_id = ?`, [req.params.id, req.tenant.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Chirurgie non trouvée' });
  res.json({ success: true, data: rows[0] });
}));

// POST /api/v1/clinic/surgeries
router.post('/', asyncHandler(async (req, res) => {
  const tenantId = req.tenant.id;
  const b = req.body;
  if (!b.animal_id) return res.status(400).json({ success: false, message: 'animal_id est requis' });
  if (!b.procedure_name) return res.status(400).json({ success: false, message: 'procedure_name est requis' });

  const [result] = await db.query(
    `INSERT INTO rv_surgery (tenant_id, encounter_id, animal_id, procedure_name, anesthesia_type,
      pre_op_notes, post_op_notes, complications, surgeon_id, assistant_id,
      scheduled_date, start_time, end_time, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [tenantId, b.encounter_id || null, b.animal_id, b.procedure_name,
      b.anesthesia_type || null, b.pre_op_notes || null, b.post_op_notes || null,
      b.complications || null, b.surgeon_id || null, b.assistant_id || null,
      toMysqlDatetime(b.scheduled_date), toMysqlDatetime(b.start_time),
      toMysqlDatetime(b.end_time), b.status || 'planned', req.user.id]
  );
  await logAudit(tenantId, req.user.id, 'surgery', result.insertId, 'create', null, b, req.ip);
  res.status(201).json({ success: true, data: { id: result.insertId } });
}));

// PUT /api/v1/clinic/surgeries/:id
router.put('/:id', asyncHandler(async (req, res) => {
  const fields = ['encounter_id', 'procedure_name', 'anesthesia_type', 'pre_op_notes',
    'post_op_notes', 'complications', 'surgeon_id', 'assistant_id', 'status'];
  const updates = []; const values = [];
  for (const f of fields) { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); } }
  for (const f of ['scheduled_date', 'start_time', 'end_time']) {
    if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(toMysqlDatetime(req.body[f])); }
  }
  if (!updates.length) return res.status(400).json({ success: false, message: 'Aucun champ à mettre à jour' });
  values.push(req.params.id, req.tenant.id);
  const [result] = await db.query(`UPDATE rv_surgery SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`, values);
  if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Non trouvé' });
  await logAudit(req.tenant.id, req.user.id, 'surgery', req.params.id, 'update', null, req.body, req.ip);
  res.json({ success: true, message: 'Mis à jour' });
}));

// POST /api/v1/clinic/surgeries/:id/complete
router.post('/:id/complete', asyncHandler(async (req, res) => {
  const [result] = await db.query(
    "UPDATE rv_surgery SET status = 'completed', end_time = NOW() WHERE id = ? AND tenant_id = ? AND status IN ('planned','in_progress')",
    [req.params.id, req.tenant.id]);
  if (!result.affectedRows) return res.status(400).json({ success: false, message: 'Impossible de terminer' });
  await logAudit(req.tenant.id, req.user.id, 'surgery', req.params.id, 'complete', null, { status: 'completed' }, req.ip);
  res.json({ success: true, message: 'Chirurgie terminée' });
}));

// POST /api/v1/clinic/surgeries/:id/cancel
router.post('/:id/cancel', asyncHandler(async (req, res) => {
  const [result] = await db.query(
    "UPDATE rv_surgery SET status = 'cancelled' WHERE id = ? AND tenant_id = ? AND status IN ('planned','in_progress')",
    [req.params.id, req.tenant.id]);
  if (!result.affectedRows) return res.status(400).json({ success: false, message: 'Impossible d\'annuler' });
  await logAudit(req.tenant.id, req.user.id, 'surgery', req.params.id, 'cancel', null, { status: 'cancelled' }, req.ip);
  res.json({ success: true, message: 'Chirurgie annulée' });
}));

module.exports = router;
