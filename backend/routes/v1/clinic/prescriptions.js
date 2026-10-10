const express = require('express');
const router = express.Router();
const db = require('../../../config/db');
const { logAudit } = require('../../../services/auditService');
const notificationService = require('../../../services/notificationService');
const validate = require('../../../middleware/validate');
const asyncHandler = require('../../../utils/asyncHandler');
const { createPrescription, updatePrescription } = require('../../../validators/clinic');

// GET /api/v1/clinic/prescriptions
router.get('/', asyncHandler(async (req, res) => {
  const tenantId = req.tenant.id;
  const { animal_id, status, page = 1, limit: rawLimit = 25 } = req.query;
  const limit = Math.min(parseInt(rawLimit) || 25, 100);
  const offset = (page - 1) * limit;
  let where = 'WHERE rx.tenant_id = ?';
  const params = [tenantId];
  if (animal_id) { where += ' AND rx.animal_id = ?'; params.push(animal_id); }
  if (status) { where += ' AND rx.status = ?'; params.push(status); }

  const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM rv_prescription rx ${where}`, params);
  const [rows] = await db.query(
    `SELECT rx.*, a.name as animal_name, a.animal_code, p.display_name as owner_name, CONCAT(u.first_name, ' ', u.last_name) as prescriber_name
     FROM rv_prescription rx
     LEFT JOIN rv_animal a ON rx.animal_id = a.id
     LEFT JOIN rv_party p ON rx.party_id = p.id
     LEFT JOIN rv_users u ON rx.prescriber_user_id = u.id
     ${where} ORDER BY rx.prescription_date DESC LIMIT ? OFFSET ?`,
    [...params, limit, parseInt(offset)]
  );
  res.json({ success: true, data: rows, pagination: { total, page: parseInt(page), limit, totalPages: Math.ceil(total / limit) } });
}));

// GET /api/v1/clinic/prescriptions/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT rx.*, a.name as animal_name, a.animal_code, p.display_name as owner_name, CONCAT(u.first_name, ' ', u.last_name) as prescriber_name
     FROM rv_prescription rx
     LEFT JOIN rv_animal a ON rx.animal_id = a.id LEFT JOIN rv_party p ON rx.party_id = p.id
     LEFT JOIN rv_users u ON rx.prescriber_user_id = u.id
     WHERE rx.id = ? AND rx.tenant_id = ?`, [req.params.id, req.tenant.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
  const [lines] = await db.query('SELECT * FROM rv_prescription_line WHERE prescription_id = ?', [req.params.id]);
  res.json({ success: true, data: { ...rows[0], lines } });
}));

// POST /api/v1/clinic/prescriptions
router.post('/', createPrescription, validate, asyncHandler(async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const b = req.body;

    const [[{ cnt }]] = await conn.query('SELECT COUNT(*) as cnt FROM rv_prescription WHERE tenant_id = ?', [req.tenant.id]);
    const prescription_number = `RX-${String(cnt + 1).padStart(5, '0')}`;

    const [result] = await conn.query(
      `INSERT INTO rv_prescription (tenant_id, encounter_id, animal_id, party_id, prescriber_user_id, prescription_number, prescription_date, status, valid_until, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
      [req.tenant.id, b.encounter_id || null, b.animal_id, b.party_id, req.user.id, prescription_number,
        b.prescription_date || new Date().toISOString().split('T')[0], b.valid_until || null, b.notes || null]
    );
    const rxId = result.insertId;

    if (b.lines && b.lines.length > 0) {
      for (const l of b.lines) {
        await conn.query(
          `INSERT INTO rv_prescription_line (prescription_id, product_name, product_id, dosage, dosage_unit, frequency, duration_days, quantity, route, instructions)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [rxId, l.product_name, l.product_id || null, l.dosage || null, l.dosage_unit || null,
            l.frequency || null, l.duration_days || null, l.quantity || null, l.route || null, l.instructions || null]
        );
      }
    }

    await conn.commit();
    await logAudit(req.tenant.id, req.user.id, 'prescription', rxId, 'create', null, b, req.ip);

    // Notify the prescriber (assigned vet) about the new prescription
    try {
      const [animals] = await db.query('SELECT name FROM rv_animal WHERE id = ?', [b.animal_id]);
      const animalName = animals.length ? animals[0].name : 'inconnu';
      await notificationService.createNotification(req.tenant.id, req.user.id, {
        type: 'info',
        title: `Nouvelle ordonnance créée pour ${animalName}`,
        data: { prescription_id: rxId, prescription_number }
      });
    } catch (_) { /* notification failure must not break main flow */ }

    res.status(201).json({ success: true, data: { id: rxId, prescription_number } });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally { conn.release(); }
}));

// PUT /api/v1/clinic/prescriptions/:id
router.put('/:id', updatePrescription, validate, asyncHandler(async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const rxId = req.params.id;
    const b = req.body;

    const updates = []; const values = [];
    for (const f of ['status', 'valid_until', 'notes']) {
      if (b[f] !== undefined) { updates.push(`${f} = ?`); values.push(b[f]); }
    }
    if (updates.length) {
      values.push(rxId, req.tenant.id);
      await conn.query(`UPDATE rv_prescription SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`, values);
    }

    if (b.lines) {
      await conn.query('DELETE FROM rv_prescription_line WHERE prescription_id = ?', [rxId]);
      for (const l of b.lines) {
        await conn.query(
          `INSERT INTO rv_prescription_line (prescription_id, product_name, product_id, dosage, dosage_unit, frequency, duration_days, quantity, route, instructions)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [rxId, l.product_name, l.product_id || null, l.dosage || null, l.dosage_unit || null,
            l.frequency || null, l.duration_days || null, l.quantity || null, l.route || null, l.instructions || null]
        );
      }
    }

    await conn.commit();
    res.json({ success: true, message: 'Updated' });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally { conn.release(); }
}));

// POST /api/v1/clinic/prescriptions/:id/void
router.post('/:id/void', asyncHandler(async (req, res) => {
  const [result] = await db.query(
    "UPDATE rv_prescription SET status = 'cancelled' WHERE id = ? AND tenant_id = ? AND status NOT IN ('cancelled','dispensed')",
    [req.params.id, req.tenant.id]);
  if (!result.affectedRows) return res.status(400).json({ success: false, message: 'Cannot void' });
  await logAudit(req.tenant.id, req.user.id, 'prescription', req.params.id, 'void', null, null, req.ip);
  res.json({ success: true, message: 'Voided' });
}));

module.exports = router;
