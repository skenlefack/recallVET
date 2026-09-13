const express = require('express');
const router = express.Router();
const db = require('../../../config/db');
const { logAudit } = require('../../../services/auditService');
const validate = require('../../../middleware/validate');
const asyncHandler = require('../../../utils/asyncHandler');
const { createStockLocation, createStockMovement } = require('../../../validators/pharmacy');

// GET /locations
router.get('/locations', asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT * FROM rv_stock_location WHERE tenant_id = ? AND is_active = 1 ORDER BY name', [req.tenant.id]);
  res.json({ success: true, data: rows });
}));

router.post('/locations', createStockLocation, validate, asyncHandler(async (req, res) => {
  const { name, site_id, location_type } = req.body;
  const [result] = await db.query('INSERT INTO rv_stock_location (tenant_id, site_id, name, location_type) VALUES (?, ?, ?, ?)',
    [req.tenant.id, site_id || null, name, location_type || 'main_store']);
  res.status(201).json({ success: true, data: { id: result.insertId } });
}));

// GET /levels — aggregated stock per product
router.get('/levels', asyncHandler(async (req, res) => {
  const { search, location_id } = req.query;
  let where = 'WHERE sl.tenant_id = ? AND sl.status = ?';
  const params = [req.tenant.id, 'available'];
  if (location_id) { where += ' AND sl.location_id = ?'; params.push(location_id); }

  let having = '';
  if (search) { having = 'HAVING product_name LIKE ?'; params.push(`%${search}%`); }

  const [rows] = await db.query(
    `SELECT sl.product_id, p.name as product_name, p.sku, p.unit, p.reorder_level,
            SUM(sl.quantity_on_hand) as total_on_hand, SUM(sl.quantity_reserved) as total_reserved,
            MIN(sl.expiry_date) as earliest_expiry, COUNT(sl.id) as lot_count
     FROM rv_stock_lot sl LEFT JOIN rv_product p ON sl.product_id = p.id
     ${where} GROUP BY sl.product_id, p.name, p.sku, p.unit, p.reorder_level ${having}
     ORDER BY p.name`, params);
  res.json({ success: true, data: rows });
}));

// GET /lots
router.get('/lots', asyncHandler(async (req, res) => {
  const { product_id, location_id, expiring_before, status, page = 1, limit: rawLimit = 50 } = req.query;
  const limit = Math.min(parseInt(rawLimit) || 50, 50);
  const offset = (page - 1) * limit;
  let where = 'WHERE sl.tenant_id = ?';
  const params = [req.tenant.id];
  if (product_id) { where += ' AND sl.product_id = ?'; params.push(product_id); }
  if (location_id) { where += ' AND sl.location_id = ?'; params.push(location_id); }
  if (expiring_before) { where += ' AND sl.expiry_date <= ?'; params.push(expiring_before); }
  if (status) { where += ' AND sl.status = ?'; params.push(status); }
  else { where += " AND sl.status = 'available'"; }

  const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM rv_stock_lot sl ${where}`, params);
  const [rows] = await db.query(
    `SELECT sl.*, p.name as product_name, p.sku, loc.name as location_name
     FROM rv_stock_lot sl LEFT JOIN rv_product p ON sl.product_id = p.id LEFT JOIN rv_stock_location loc ON sl.location_id = loc.id
     ${where} ORDER BY sl.expiry_date ASC LIMIT ? OFFSET ?`,
    [...params, limit, parseInt(offset)]);
  res.json({ success: true, data: rows, pagination: { total, page: parseInt(page), limit, totalPages: Math.ceil(total / limit) } });
}));

// POST /movements — manual stock movement
router.post('/movements', createStockMovement, validate, asyncHandler(async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const b = req.body;

    // For outgoing movements, decrement lot
    if (['adjustment_out', 'damaged', 'expired'].includes(b.movement_type) && b.lot_id) {
      const [lots] = await conn.query('SELECT * FROM rv_stock_lot WHERE id = ? FOR UPDATE', [b.lot_id]);
      if (!lots.length || lots[0].quantity_on_hand < b.quantity) {
        await conn.rollback();
        return res.status(400).json({ success: false, message: 'Insufficient stock' });
      }
      await conn.query('UPDATE rv_stock_lot SET quantity_on_hand = quantity_on_hand - ? WHERE id = ?', [b.quantity, b.lot_id]);
    }

    // For incoming movements, increment lot
    if (['adjustment_in', 'return'].includes(b.movement_type) && b.lot_id) {
      await conn.query('UPDATE rv_stock_lot SET quantity_on_hand = quantity_on_hand + ? WHERE id = ?', [b.quantity, b.lot_id]);
    }

    // For transfers
    if (b.movement_type === 'transfer' && b.lot_id && b.to_location_id) {
      const [lots] = await conn.query('SELECT * FROM rv_stock_lot WHERE id = ? FOR UPDATE', [b.lot_id]);
      if (!lots.length || lots[0].quantity_on_hand < b.quantity) {
        await conn.rollback();
        return res.status(400).json({ success: false, message: 'Insufficient stock' });
      }
      await conn.query('UPDATE rv_stock_lot SET quantity_on_hand = quantity_on_hand - ? WHERE id = ?', [b.quantity, b.lot_id]);
      // Create or update lot in destination
      const [existing] = await conn.query(
        'SELECT id FROM rv_stock_lot WHERE product_id = ? AND location_id = ? AND lot_number <=> ? AND batch_number <=> ?',
        [lots[0].product_id, b.to_location_id, lots[0].lot_number, lots[0].batch_number]);
      if (existing.length) {
        await conn.query('UPDATE rv_stock_lot SET quantity_on_hand = quantity_on_hand + ? WHERE id = ?', [b.quantity, existing[0].id]);
      } else {
        await conn.query(
          'INSERT INTO rv_stock_lot (tenant_id, product_id, location_id, lot_number, batch_number, expiry_date, quantity_on_hand, unit_cost) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [req.tenant.id, lots[0].product_id, b.to_location_id, lots[0].lot_number, lots[0].batch_number, lots[0].expiry_date, b.quantity, lots[0].unit_cost]);
      }
    }

    const [result] = await conn.query(
      `INSERT INTO rv_stock_movement (tenant_id, product_id, lot_id, from_location_id, to_location_id, movement_type, quantity, reference_type, reference_id, reason, performed_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.tenant.id, b.product_id, b.lot_id || null, b.from_location_id || null, b.to_location_id || null,
        b.movement_type, b.quantity, b.reference_type || null, b.reference_id || null, b.reason || null, req.user.id]);

    await conn.commit();
    await logAudit(req.tenant.id, req.user.id, 'stock_movement', result.insertId, 'create', null, b, req.ip);
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally { conn.release(); }
}));

// GET /movements
router.get('/movements', asyncHandler(async (req, res) => {
  const { product_id, movement_type, date_from, date_to, page = 1, limit: rawLimit = 50 } = req.query;
  const limit = Math.min(parseInt(rawLimit) || 50, 50);
  const offset = (page - 1) * limit;
  let where = 'WHERE sm.tenant_id = ?';
  const params = [req.tenant.id];
  if (product_id) { where += ' AND sm.product_id = ?'; params.push(product_id); }
  if (movement_type) { where += ' AND sm.movement_type = ?'; params.push(movement_type); }
  if (date_from) { where += ' AND sm.created_at >= ?'; params.push(date_from); }
  if (date_to) { where += ' AND sm.created_at <= ?'; params.push(date_to + ' 23:59:59'); }

  const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM rv_stock_movement sm ${where}`, params);
  const [rows] = await db.query(
    `SELECT sm.*, p.name as product_name, u.username as performed_by_name
     FROM rv_stock_movement sm LEFT JOIN rv_product p ON sm.product_id = p.id LEFT JOIN users u ON sm.performed_by = u.id
     ${where} ORDER BY sm.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, parseInt(offset)]);
  res.json({ success: true, data: rows, pagination: { total, page: parseInt(page), limit, totalPages: Math.ceil(total / limit) } });
}));

module.exports = router;
