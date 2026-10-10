const express = require('express');
const router = express.Router();
const db = require('../../../config/db');
const { logAudit } = require('../../../services/auditService');
const validate = require('../../../middleware/validate');
const asyncHandler = require('../../../utils/asyncHandler');
const { createDispense } = require('../../../validators/pharmacy');

const toMysqlDatetime = (v) => v ? new Date(v).toISOString().slice(0, 19).replace('T', ' ') : null;

router.get('/', asyncHandler(async (req, res) => {
  const { prescription_id, page = 1, limit: rawLimit = 25 } = req.query;
  const limit = Math.min(parseInt(rawLimit) || 25, 100);
  const offset = (page - 1) * limit;
  let where = 'WHERE d.tenant_id = ?';
  const params = [req.tenant.id];
  if (prescription_id) { where += ' AND d.prescription_id = ?'; params.push(prescription_id); }
  const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM rv_dispense_transaction d ${where}`, params);
  const [rows] = await db.query(
    `SELECT d.*, a.name as animal_name, p.display_name as party_name, u.username as dispensed_by_name
     FROM rv_dispense_transaction d
     LEFT JOIN rv_animal a ON d.animal_id = a.id LEFT JOIN rv_party p ON d.party_id = p.id LEFT JOIN users u ON d.dispensed_by = u.id
     ${where} ORDER BY d.dispense_date DESC LIMIT ? OFFSET ?`,
    [...params, limit, parseInt(offset)]);
  res.json({ success: true, data: rows, pagination: { total, page: parseInt(page), limit, totalPages: Math.ceil(total / limit) } });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT * FROM rv_dispense_transaction WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenant.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
  const [lines] = await db.query(
    `SELECT dl.*, p.name as product_name FROM rv_dispense_line dl LEFT JOIN rv_product p ON dl.product_id = p.id WHERE dl.dispense_id = ?`, [req.params.id]);
  res.json({ success: true, data: { ...rows[0], lines } });
}));

// POST / — dispense from prescription
router.post('/', createDispense, validate, asyncHandler(async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const b = req.body;
    const [[{ cnt }]] = await conn.query('SELECT COUNT(*) as cnt FROM rv_dispense_transaction WHERE tenant_id = ?', [req.tenant.id]);
    const dispense_number = `DISP-${String(cnt + 1).padStart(5, '0')}`;

    const [result] = await conn.query(
      `INSERT INTO rv_dispense_transaction (tenant_id, prescription_id, animal_id, party_id, dispensed_by, dispense_date, dispense_number, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.tenant.id, b.prescription_id || null, b.animal_id || null, b.party_id || null,
        req.user.id, toMysqlDatetime(b.dispense_date || new Date().toISOString()), dispense_number, b.notes || null]);
    const dispId = result.insertId;

    if (b.lines && b.lines.length) {
      for (const l of b.lines) {
        // Decrement stock
        if (l.lot_id) {
          const [lots] = await conn.query('SELECT * FROM rv_stock_lot WHERE id = ? FOR UPDATE', [l.lot_id]);
          if (lots.length && lots[0].quantity_on_hand >= l.quantity) {
            await conn.query('UPDATE rv_stock_lot SET quantity_on_hand = quantity_on_hand - ? WHERE id = ?', [l.quantity, l.lot_id]);
            await conn.query(
              `INSERT INTO rv_stock_movement (tenant_id, product_id, lot_id, from_location_id, movement_type, quantity, reference_type, reference_id, performed_by)
               VALUES (?, ?, ?, ?, 'dispense', ?, 'dispense', ?, ?)`,
              [req.tenant.id, l.product_id, l.lot_id, lots[0].location_id, l.quantity, dispId, req.user.id]);
          }
        }
        await conn.query(
          'INSERT INTO rv_dispense_line (dispense_id, prescription_line_id, product_id, lot_id, quantity, unit_price, instructions) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [dispId, l.prescription_line_id || null, l.product_id || null, l.lot_id || null, l.quantity, l.unit_price || 0, l.instructions || null]);

        // Mark prescription line as dispensed
        if (l.prescription_line_id) {
          await conn.query('UPDATE rv_prescription_line SET is_dispensed = 1 WHERE id = ?', [l.prescription_line_id]);
        }
      }

      // Update prescription status
      if (b.prescription_id) {
        const [rxLines] = await conn.query('SELECT * FROM rv_prescription_line WHERE prescription_id = ?', [b.prescription_id]);
        const allDispensed = rxLines.length > 0 && rxLines.every(l => l.is_dispensed);
        const status = allDispensed ? 'dispensed' : 'partially_dispensed';
        await conn.query('UPDATE rv_prescription SET status = ? WHERE id = ?', [status, b.prescription_id]);
      }
    }

    await conn.commit();
    await logAudit(req.tenant.id, req.user.id, 'dispense', dispId, 'create', null, b, req.ip);
    res.status(201).json({ success: true, data: { id: dispId, dispense_number } });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally { conn.release(); }
}));

module.exports = router;
