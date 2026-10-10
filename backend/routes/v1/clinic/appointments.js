const express = require('express');
const router = express.Router();
const db = require('../../../config/db');
const { logAudit } = require('../../../services/auditService');
const notificationService = require('../../../services/notificationService');
const validate = require('../../../middleware/validate');
const asyncHandler = require('../../../utils/asyncHandler');
const { createAppointment, updateAppointment } = require('../../../validators/clinic');

// GET /api/v1/clinic/appointments
router.get('/', asyncHandler(async (req, res) => {
  const tenantId = req.tenant.id;
  const { date, site_id, vet_user_id, status, page = 1, limit: rawLimit = 25 } = req.query;
  const limit = Math.min(parseInt(rawLimit) || 25, 100);
  const offset = (page - 1) * limit;
  let where = 'WHERE ap.tenant_id = ?';
  const params = [tenantId];
  if (date) { where += ' AND ap.scheduled_date = ?'; params.push(date); }
  if (site_id) { where += ' AND ap.site_id = ?'; params.push(site_id); }
  if (vet_user_id) { where += ' AND ap.vet_user_id = ?'; params.push(vet_user_id); }
  if (status) { where += ' AND ap.status = ?'; params.push(status); }

  const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM rv_appointment ap ${where}`, params);
  const [rows] = await db.query(
    `SELECT ap.*, a.name as animal_name, a.animal_code, s.name_fr as species_name,
            p.display_name as owner_name, CONCAT(u.first_name, ' ', u.last_name) as vet_name
     FROM rv_appointment ap
     LEFT JOIN rv_animal a ON ap.animal_id = a.id
     LEFT JOIN rv_species s ON a.species_id = s.id
     LEFT JOIN rv_party p ON ap.party_id = p.id
     LEFT JOIN rv_users u ON ap.vet_user_id = u.id
     ${where} ORDER BY ap.scheduled_date DESC, ap.start_time ASC LIMIT ? OFFSET ?`,
    [...params, limit, parseInt(offset)]
  );
  res.json({ success: true, data: rows, pagination: { total, page: parseInt(page), limit, totalPages: Math.ceil(total / limit) } });
}));

// GET /api/v1/clinic/appointments/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT ap.*, a.name as animal_name, a.animal_code, s.name_fr as species_name,
            p.display_name as owner_name, p.phone_primary as owner_phone, CONCAT(u.first_name, ' ', u.last_name) as vet_name
     FROM rv_appointment ap
     LEFT JOIN rv_animal a ON ap.animal_id = a.id LEFT JOIN rv_species s ON a.species_id = s.id
     LEFT JOIN rv_party p ON ap.party_id = p.id LEFT JOIN rv_users u ON ap.vet_user_id = u.id
     WHERE ap.id = ? AND ap.tenant_id = ?`, [req.params.id, req.tenant.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Appointment not found' });
  res.json({ success: true, data: rows[0] });
}));

// POST /api/v1/clinic/appointments
router.post('/', createAppointment, validate, asyncHandler(async (req, res) => {
  const tenantId = req.tenant.id;
  const { animal_id, party_id, vet_user_id, site_id, appointment_type, scheduled_date, start_time, end_time, urgency_level, booking_channel, reason, special_instructions, send_reminder, reminder_channel, notes } = req.body;

  const [result] = await db.query(
    `INSERT INTO rv_appointment (tenant_id, site_id, animal_id, party_id, vet_user_id, appointment_type, scheduled_date, start_time, end_time, urgency_level, booking_channel, reason, special_instructions, send_reminder, reminder_channel, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [tenantId, site_id || null, animal_id, party_id, vet_user_id, appointment_type || 'consultation', scheduled_date, start_time || null, end_time || null, urgency_level || 'normal', booking_channel || 'walk_in', reason || null, special_instructions || null, send_reminder ? 1 : 0, reminder_channel || null, notes || null, req.user.id]
  );
  await logAudit(tenantId, req.user.id, 'appointment', result.insertId, 'create', null, req.body, req.ip);

  // Notify assigned vet about the new appointment
  if (vet_user_id) {
    try {
      const [animals] = await db.query('SELECT name FROM rv_animal WHERE id = ?', [animal_id]);
      const animalName = animals.length ? animals[0].name : 'inconnu';
      await notificationService.createNotification(tenantId, vet_user_id, {
        type: 'info',
        title: `Nouveau rendez-vous planifié pour ${animalName}`,
        data: { appointment_id: result.insertId }
      });
    } catch (_) { /* notification failure must not break main flow */ }
  }

  res.status(201).json({ success: true, data: { id: result.insertId } });
}));

// PUT /api/v1/clinic/appointments/:id
router.put('/:id', updateAppointment, validate, asyncHandler(async (req, res) => {
  const fields = ['site_id', 'animal_id', 'party_id', 'vet_user_id', 'appointment_type', 'scheduled_date', 'start_time', 'end_time', 'urgency_level', 'booking_channel', 'reason', 'special_instructions', 'send_reminder', 'reminder_channel', 'status', 'notes'];
  const updates = []; const values = [];
  for (const f of fields) { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); } }
  if (!updates.length) return res.status(400).json({ success: false, message: 'No fields to update' });
  values.push(req.params.id, req.tenant.id);
  const [result] = await db.query(`UPDATE rv_appointment SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`, values);
  if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Not found' });
  await logAudit(req.tenant.id, req.user.id, 'appointment', req.params.id, 'update', null, req.body, req.ip);
  res.json({ success: true, message: 'Updated' });
}));

// POST /api/v1/clinic/appointments/:id/check-in
router.post('/:id/check-in', asyncHandler(async (req, res) => {
  const [result] = await db.query("UPDATE rv_appointment SET status = 'checked_in' WHERE id = ? AND tenant_id = ? AND status IN ('scheduled','confirmed')", [req.params.id, req.tenant.id]);
  if (!result.affectedRows) return res.status(400).json({ success: false, message: 'Cannot check in' });
  await logAudit(req.tenant.id, req.user.id, 'appointment', req.params.id, 'status_change', null, { status: 'checked_in' }, req.ip);
  res.json({ success: true, message: 'Checked in' });
}));

// POST /api/v1/clinic/appointments/:id/cancel
router.post('/:id/cancel', asyncHandler(async (req, res) => {
  const [result] = await db.query("UPDATE rv_appointment SET status = 'cancelled' WHERE id = ? AND tenant_id = ? AND status NOT IN ('completed','cancelled')", [req.params.id, req.tenant.id]);
  if (!result.affectedRows) return res.status(400).json({ success: false, message: 'Cannot cancel' });
  await logAudit(req.tenant.id, req.user.id, 'appointment', req.params.id, 'status_change', null, { status: 'cancelled' }, req.ip);

  // Notify assigned vet about the cancellation
  try {
    const [appts] = await db.query(
      `SELECT ap.vet_user_id, a.name as animal_name FROM rv_appointment ap
       LEFT JOIN rv_animal a ON ap.animal_id = a.id
       WHERE ap.id = ? AND ap.tenant_id = ?`, [req.params.id, req.tenant.id]);
    if (appts.length && appts[0].vet_user_id) {
      await notificationService.createNotification(req.tenant.id, appts[0].vet_user_id, {
        type: 'error',
        title: `Rendez-vous annulé pour ${appts[0].animal_name || 'inconnu'}`,
        data: { appointment_id: parseInt(req.params.id) }
      });
    }
  } catch (_) { /* notification failure must not break main flow */ }

  res.json({ success: true, message: 'Cancelled' });
}));

// POST /api/v1/clinic/appointments/:id/no-show
router.post('/:id/no-show', asyncHandler(async (req, res) => {
  const [result] = await db.query("UPDATE rv_appointment SET status = 'no_show' WHERE id = ? AND tenant_id = ?", [req.params.id, req.tenant.id]);
  if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, message: 'Marked as no-show' });
}));

// POST /api/v1/clinic/appointments/:id/convert — create encounter from appointment
router.post('/:id/convert', asyncHandler(async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [appts] = await conn.query('SELECT * FROM rv_appointment WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenant.id]);
    if (!appts.length) { await conn.rollback(); return res.status(404).json({ success: false, message: 'Not found' }); }
    const ap = appts[0];
    const [result] = await conn.query(
      `INSERT INTO rv_encounter (tenant_id, site_id, appointment_id, animal_id, party_id, vet_user_id, encounter_date, encounter_type, visit_reason, created_by)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)`,
      [ap.tenant_id, ap.site_id, ap.id, ap.animal_id, ap.party_id, ap.vet_user_id, ap.appointment_type === 'vaccination' ? 'vaccination' : 'consultation', ap.reason, req.user.id]
    );
    await conn.query("UPDATE rv_appointment SET status = 'in_progress' WHERE id = ?", [ap.id]);
    await conn.commit();
    res.json({ success: true, data: { encounter_id: result.insertId } });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally { conn.release(); }
}));

module.exports = router;
