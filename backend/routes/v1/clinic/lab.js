const express = require('express');
const router = express.Router();
const db = require('../../../config/db');
const { logAudit } = require('../../../services/auditService');
const asyncHandler = require('../../../utils/asyncHandler');

// GET /api/v1/clinic/lab/requests
router.get('/requests', asyncHandler(async (req, res) => {
  const tenantId = req.tenant.id;
  const { animal_id, status, page = 1, limit: rawLimit = 25 } = req.query;
  const limit = Math.min(parseInt(rawLimit) || 25, 100);
  const offset = (page - 1) * limit;
  let where = 'WHERE lr.tenant_id = ?';
  const params = [tenantId];
  if (animal_id) { where += ' AND lr.animal_id = ?'; params.push(animal_id); }
  if (status) { where += ' AND lr.status = ?'; params.push(status); }

  const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM rv_lab_request lr ${where}`, params);
  const [rows] = await db.query(
    `SELECT lr.*, a.name as animal_name, a.animal_code,
            CONCAT(u.first_name, ' ', u.last_name) as requested_by_name
     FROM rv_lab_request lr
     LEFT JOIN rv_animal a ON lr.animal_id = a.id
     LEFT JOIN rv_users u ON lr.requested_by = u.id
     ${where} ORDER BY lr.requested_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, parseInt(offset)]
  );
  res.json({ success: true, data: rows, pagination: { total, page: parseInt(page), limit, totalPages: Math.ceil(total / limit) } });
}));

// GET /api/v1/clinic/lab/requests/:id
router.get('/requests/:id', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT lr.*, a.name as animal_name, a.animal_code,
            CONCAT(u.first_name, ' ', u.last_name) as requested_by_name
     FROM rv_lab_request lr
     LEFT JOIN rv_animal a ON lr.animal_id = a.id
     LEFT JOIN rv_users u ON lr.requested_by = u.id
     WHERE lr.id = ? AND lr.tenant_id = ?`, [req.params.id, req.tenant.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });

  const [results] = await db.query(
    `SELECT r.*, CONCAT(u.first_name, ' ', u.last_name) as recorded_by_name
     FROM rv_lab_result r
     LEFT JOIN rv_users u ON r.recorded_by = u.id
     WHERE r.request_id = ? AND r.tenant_id = ?`, [req.params.id, req.tenant.id]);

  res.json({ success: true, data: { ...rows[0], results } });
}));

// POST /api/v1/clinic/lab/requests
router.post('/requests', asyncHandler(async (req, res) => {
  const b = req.body;
  if (!b.animal_id || !b.test_type || !b.test_name) {
    return res.status(400).json({ success: false, message: 'animal_id, test_type et test_name sont requis' });
  }
  const [result] = await db.query(
    `INSERT INTO rv_lab_request (tenant_id, encounter_id, animal_id, test_type, test_name, priority, notes, requested_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.tenant.id, b.encounter_id || null, b.animal_id, b.test_type, b.test_name,
     b.priority || 'routine', b.notes || null, req.user.id]
  );
  await logAudit(req.tenant.id, req.user.id, 'lab_request', result.insertId, 'create', null, b, req.ip);
  res.status(201).json({ success: true, data: { id: result.insertId } });
}));

// PUT /api/v1/clinic/lab/requests/:id
router.put('/requests/:id', asyncHandler(async (req, res) => {
  const fields = ['test_type', 'test_name', 'priority', 'notes', 'status'];
  const updates = []; const values = [];
  for (const f of fields) { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); } }
  if (!updates.length) return res.status(400).json({ success: false, message: 'No fields' });
  values.push(req.params.id, req.tenant.id);
  const [result] = await db.query(`UPDATE rv_lab_request SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`, values);
  if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Not found' });
  await logAudit(req.tenant.id, req.user.id, 'lab_request', req.params.id, 'update', null, req.body, req.ip);
  res.json({ success: true, message: 'Updated' });
}));

// POST /api/v1/clinic/lab/requests/:id/results
router.post('/requests/:id/results', asyncHandler(async (req, res) => {
  const { results } = req.body;
  if (!Array.isArray(results) || results.length === 0) {
    return res.status(400).json({ success: false, message: 'results array is required' });
  }
  // Verify request exists and belongs to tenant
  const [reqRows] = await db.query('SELECT id FROM rv_lab_request WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenant.id]);
  if (!reqRows.length) return res.status(404).json({ success: false, message: 'Request not found' });

  const insertedIds = [];
  for (const r of results) {
    const [result] = await db.query(
      `INSERT INTO rv_lab_result (request_id, tenant_id, parameter_name, result_value, unit, reference_range, is_abnormal, notes, recorded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.params.id, req.tenant.id, r.parameter_name, r.result_value || null, r.unit || null,
       r.reference_range || null, r.is_abnormal ? 1 : 0, r.notes || null, req.user.id]
    );
    insertedIds.push(result.insertId);
  }
  await logAudit(req.tenant.id, req.user.id, 'lab_result', req.params.id, 'create', null, { count: results.length }, req.ip);
  res.status(201).json({ success: true, data: { ids: insertedIds } });
}));

// GET /api/v1/clinic/lab/requests/:id/results
router.get('/requests/:id/results', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT r.*, CONCAT(u.first_name, ' ', u.last_name) as recorded_by_name
     FROM rv_lab_result r
     LEFT JOIN rv_users u ON r.recorded_by = u.id
     WHERE r.request_id = ? AND r.tenant_id = ?`, [req.params.id, req.tenant.id]);
  res.json({ success: true, data: rows });
}));

module.exports = router;
