const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const asyncHandler = require('../../utils/asyncHandler');

// GET /api/v1/analytics/revenue
router.get('/revenue', asyncHandler(async (req, res) => {
  const { period = 'monthly', date_from, date_to } = req.query;
  let groupExpr, selectExpr;
  switch (period) {
    case 'daily':
      selectExpr = "DATE(invoice_date) as period";
      groupExpr = "DATE(invoice_date)";
      break;
    case 'weekly':
      selectExpr = "DATE(DATE_SUB(invoice_date, INTERVAL WEEKDAY(invoice_date) DAY)) as period";
      groupExpr = "DATE(DATE_SUB(invoice_date, INTERVAL WEEKDAY(invoice_date) DAY))";
      break;
    default: // monthly
      selectExpr = "DATE_FORMAT(invoice_date, '%Y-%m') as period";
      groupExpr = "DATE_FORMAT(invoice_date, '%Y-%m')";
  }

  let where = "WHERE tenant_id = ? AND status NOT IN ('cancelled','void')";
  const params = [req.tenant.id];
  if (date_from) { where += ' AND invoice_date >= ?'; params.push(date_from); }
  if (date_to) { where += ' AND invoice_date <= ?'; params.push(date_to); }

  const [rows] = await db.query(
    `SELECT ${selectExpr}, SUM(total_amount) as total_revenue, COUNT(*) as invoice_count
     FROM rv_invoice ${where}
     GROUP BY ${groupExpr}
     ORDER BY period`, params);

  res.json({ success: true, data: rows });
}));

// GET /api/v1/analytics/encounters-by-vet
router.get('/encounters-by-vet', asyncHandler(async (req, res) => {
  const { date_from, date_to } = req.query;
  let where = 'WHERE e.tenant_id = ?';
  const params = [req.tenant.id];
  if (date_from) { where += ' AND e.encounter_date >= ?'; params.push(date_from); }
  if (date_to) { where += ' AND e.encounter_date <= ?'; params.push(date_to); }

  const [rows] = await db.query(
    `SELECT u.username as vet_name, COUNT(*) as count
     FROM rv_encounter e
     LEFT JOIN users u ON e.vet_user_id = u.id
     ${where}
     GROUP BY e.vet_user_id, u.username
     ORDER BY count DESC`, params);

  res.json({ success: true, data: rows });
}));

// GET /api/v1/analytics/appointments-stats
router.get('/appointments-stats', asyncHandler(async (req, res) => {
  const now = new Date();
  const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const lastDayStr = lastDay.toISOString().split('T')[0];

  const [rows] = await db.query(
    `SELECT status, COUNT(*) as count
     FROM rv_appointment
     WHERE tenant_id = ? AND appointment_date >= ? AND appointment_date <= ?
     GROUP BY status`,
    [req.tenant.id, firstDay, lastDayStr]);

  const stats = { scheduled: 0, completed: 0, cancelled: 0, no_show: 0 };
  for (const row of rows) {
    if (stats.hasOwnProperty(row.status)) {
      stats[row.status] = row.count;
    }
  }

  res.json({ success: true, data: stats });
}));

// GET /api/v1/analytics/top-products
router.get('/top-products', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT pr.name as product_name,
            SUM(sl.quantity) as total_quantity,
            SUM(sl.quantity * sl.unit_price) as total_revenue
     FROM rv_sale_line sl
     JOIN rv_sale s ON sl.sale_id = s.id
     JOIN rv_product pr ON sl.product_id = pr.id
     WHERE s.tenant_id = ? AND s.status != 'cancelled'
     GROUP BY pr.id, pr.name
     ORDER BY total_quantity DESC
     LIMIT 10`, [req.tenant.id]);

  res.json({ success: true, data: rows });
}));

// GET /api/v1/analytics/vaccination-stats
router.get('/vaccination-stats', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT DATE_FORMAT(vaccination_date, '%Y-%m') as month, COUNT(*) as count
     FROM rv_vaccination_event
     WHERE tenant_id = ? AND vaccination_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
     GROUP BY DATE_FORMAT(vaccination_date, '%Y-%m')
     ORDER BY month`, [req.tenant.id]);

  res.json({ success: true, data: rows });
}));

// GET /api/v1/analytics/stock-alerts
router.get('/stock-alerts', asyncHandler(async (req, res) => {
  // Products below reorder level
  const [belowReorder] = await db.query(
    `SELECT pr.id, pr.name, pr.sku, pr.reorder_level,
            COALESCE(SUM(sl.quantity_on_hand), 0) as total_on_hand
     FROM rv_product pr
     LEFT JOIN rv_stock_lot sl ON pr.id = sl.product_id AND sl.quantity_on_hand > 0
     WHERE pr.tenant_id = ? AND pr.reorder_level > 0
     GROUP BY pr.id, pr.name, pr.sku, pr.reorder_level
     HAVING total_on_hand < pr.reorder_level
     ORDER BY (total_on_hand / pr.reorder_level) ASC
     LIMIT 20`, [req.tenant.id]);

  // Lots expiring within 30 days
  const [expiringSoon] = await db.query(
    `SELECT sl.id as lot_id, pr.name as product_name, pr.sku, sl.lot_number,
            sl.expiry_date, sl.quantity_on_hand
     FROM rv_stock_lot sl
     JOIN rv_product pr ON sl.product_id = pr.id
     WHERE pr.tenant_id = ? AND sl.quantity_on_hand > 0
       AND sl.expiry_date IS NOT NULL
       AND sl.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
     ORDER BY sl.expiry_date ASC
     LIMIT 20`, [req.tenant.id]);

  res.json({
    success: true,
    data: {
      below_reorder: belowReorder,
      expiring_soon: expiringSoon
    }
  });
}));

module.exports = router;
