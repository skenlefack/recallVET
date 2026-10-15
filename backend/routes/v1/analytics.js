const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Build site/structure filter clause.
 * Expects the table to have a `site_id` or be joinable to a structure with sites.
 */
function addSiteFilter(query, params, alias, req) {
  if (req.query.structure_id) {
    query += ` AND ${alias}.structure_id = ?`;
    params.push(req.query.structure_id);
  }
  if (req.query.site_id) {
    query += ` AND ${alias}.site_id = ?`;
    params.push(req.query.site_id);
  }
  return query;
}

// GET /api/v1/analytics/multi-clinic-summary
router.get('/multi-clinic-summary', asyncHandler(async (req, res) => {
  const tenantId = req.tenant.id;
  const today = new Date().toISOString().split('T')[0];

  // Structures with their sites
  const [structures] = await db.query(
    `SELECT s.id, s.name, s.type,
            (SELECT COUNT(*) FROM rv_site si WHERE si.structure_id = s.id) as site_count
     FROM rv_structure WHERE tenant_id = ? ORDER BY name`,
    [tenantId]
  );

  // Today's appointments per structure
  const [appointmentsByStructure] = await db.query(
    `SELECT a.structure_id, s.name as structure_name,
            COUNT(*) as total,
            SUM(CASE WHEN a.status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
            SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) as completed
     FROM rv_appointment a
     LEFT JOIN rv_structure s ON a.structure_id = s.id
     WHERE a.tenant_id = ? AND a.scheduled_date = ?
     GROUP BY a.structure_id, s.name`,
    [tenantId, today]
  );

  // Revenue this month per structure
  const firstDay = `${today.slice(0, 7)}-01`;
  const [revenueByStructure] = await db.query(
    `SELECT i.structure_id, s.name as structure_name,
            SUM(i.total_amount) as revenue, COUNT(*) as invoice_count
     FROM rv_invoice i
     LEFT JOIN rv_structure s ON i.structure_id = s.id
     WHERE i.tenant_id = ? AND i.invoice_date >= ?
       AND i.status NOT IN ('cancelled','void')
     GROUP BY i.structure_id, s.name`,
    [tenantId, firstDay]
  );

  // Active animals per structure
  const [animalsByStructure] = await db.query(
    `SELECT a.structure_id, s.name as structure_name, COUNT(*) as count
     FROM rv_animal a
     LEFT JOIN rv_structure s ON a.structure_id = s.id
     WHERE a.tenant_id = ? AND a.is_alive = 1
     GROUP BY a.structure_id, s.name`,
    [tenantId]
  );

  // Stock alerts per structure (below reorder level)
  const [stockAlerts] = await db.query(
    `SELECT sl.location_id, loc.name as location_name, st.id as structure_id, st.name as structure_name,
            COUNT(*) as alert_count
     FROM rv_product pr
     LEFT JOIN rv_stock_lot sl ON pr.id = sl.product_id AND sl.quantity_on_hand > 0
     LEFT JOIN rv_stock_location loc ON sl.location_id = loc.id
     LEFT JOIN rv_structure st ON loc.structure_id = st.id
     WHERE pr.tenant_id = ? AND pr.reorder_level > 0
     GROUP BY sl.location_id, loc.name, st.id, st.name
     HAVING COALESCE(SUM(sl.quantity_on_hand), 0) < AVG(pr.reorder_level)`,
    [tenantId]
  );

  res.json({
    success: true,
    data: {
      structures,
      appointments: appointmentsByStructure,
      revenue: revenueByStructure,
      animals: animalsByStructure,
      stockAlerts
    }
  });
}));

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
  if (req.query.structure_id) { where += ' AND structure_id = ?'; params.push(req.query.structure_id); }
  if (req.query.site_id) { where += ' AND site_id = ?'; params.push(req.query.site_id); }

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
  if (req.query.structure_id) { where += ' AND e.structure_id = ?'; params.push(req.query.structure_id); }
  if (req.query.site_id) { where += ' AND e.site_id = ?'; params.push(req.query.site_id); }

  const [rows] = await db.query(
    `SELECT u.username as vet_name, COUNT(*) as count
     FROM rv_encounter e
     LEFT JOIN rv_users u ON e.vet_user_id = u.id
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

  let where = 'WHERE tenant_id = ? AND scheduled_date >= ? AND scheduled_date <= ?';
  const params = [req.tenant.id, firstDay, lastDayStr];
  if (req.query.structure_id) { where += ' AND structure_id = ?'; params.push(req.query.structure_id); }
  if (req.query.site_id) { where += ' AND site_id = ?'; params.push(req.query.site_id); }

  const [rows] = await db.query(
    `SELECT status, COUNT(*) as count FROM rv_appointment ${where} GROUP BY status`, params);

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
  let where = 'WHERE s.tenant_id = ? AND s.status != \'cancelled\'';
  const params = [req.tenant.id];
  if (req.query.structure_id) { where += ' AND s.structure_id = ?'; params.push(req.query.structure_id); }
  if (req.query.site_id) { where += ' AND s.site_id = ?'; params.push(req.query.site_id); }

  const [rows] = await db.query(
    `SELECT pr.name as product_name,
            SUM(sl.quantity) as total_quantity,
            SUM(sl.quantity * sl.unit_price) as total_revenue
     FROM rv_retail_sale_line sl
     JOIN rv_retail_sale s ON sl.retail_sale_id = s.id
     JOIN rv_product pr ON sl.product_id = pr.id
     ${where}
     GROUP BY pr.id, pr.name
     ORDER BY total_quantity DESC
     LIMIT 10`, params);

  res.json({ success: true, data: rows });
}));

// GET /api/v1/analytics/vaccination-stats
router.get('/vaccination-stats', asyncHandler(async (req, res) => {
  let where = 'WHERE tenant_id = ? AND vaccination_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)';
  const params = [req.tenant.id];
  if (req.query.structure_id) { where += ' AND structure_id = ?'; params.push(req.query.structure_id); }
  if (req.query.site_id) { where += ' AND site_id = ?'; params.push(req.query.site_id); }

  const [rows] = await db.query(
    `SELECT DATE_FORMAT(vaccination_date, '%Y-%m') as month, COUNT(*) as count
     FROM rv_vaccination_event ${where}
     GROUP BY DATE_FORMAT(vaccination_date, '%Y-%m')
     ORDER BY month`, params);

  res.json({ success: true, data: rows });
}));

// GET /api/v1/analytics/stock-alerts
router.get('/stock-alerts', asyncHandler(async (req, res) => {
  let belowWhere = 'WHERE pr.tenant_id = ? AND pr.reorder_level > 0';
  const belowParams = [req.tenant.id];
  if (req.query.structure_id) { belowWhere += ' AND loc.structure_id = ?'; belowParams.push(req.query.structure_id); }

  const [belowReorder] = await db.query(
    `SELECT pr.id, pr.name, pr.sku, pr.reorder_level,
            COALESCE(SUM(sl.quantity_on_hand), 0) as total_on_hand
     FROM rv_product pr
     LEFT JOIN rv_stock_lot sl ON pr.id = sl.product_id AND sl.quantity_on_hand > 0
     LEFT JOIN rv_stock_location loc ON sl.location_id = loc.id
     ${belowWhere}
     GROUP BY pr.id, pr.name, pr.sku, pr.reorder_level
     HAVING total_on_hand < pr.reorder_level
     ORDER BY (total_on_hand / pr.reorder_level) ASC
     LIMIT 20`, belowParams);

  let expiringWhere = 'WHERE pr.tenant_id = ? AND sl.quantity_on_hand > 0 AND sl.expiry_date IS NOT NULL AND sl.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)';
  const expiringParams = [req.tenant.id];
  if (req.query.structure_id) { expiringWhere += ' AND loc.structure_id = ?'; expiringParams.push(req.query.structure_id); }

  const [expiringSoon] = await db.query(
    `SELECT sl.id as lot_id, pr.name as product_name, pr.sku, sl.lot_number,
            sl.expiry_date, sl.quantity_on_hand
     FROM rv_stock_lot sl
     JOIN rv_product pr ON sl.product_id = pr.id
     LEFT JOIN rv_stock_location loc ON sl.location_id = loc.id
     ${expiringWhere}
     ORDER BY sl.expiry_date ASC
     LIMIT 20`, expiringParams);

  res.json({
    success: true,
    data: {
      below_reorder: belowReorder,
      expiring_soon: expiringSoon
    }
  });
}));

module.exports = router;
