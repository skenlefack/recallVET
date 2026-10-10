const express = require('express');
const router = express.Router();
const db = require('../../../config/db');
const asyncHandler = require('../../../utils/asyncHandler');
const { generateFarmVisitReportPDF } = require('../../../services/pdfService');

/**
 * Fetch tenant data for PDF headers.
 */
async function getTenantData(tenantId) {
  const [rows] = await db.query('SELECT * FROM rv_tenant WHERE id = ?', [tenantId]);
  return rows[0] || { name: 'Clinic' };
}

// GET /api/v1/farm/exports/visits/:id/pdf
router.get('/visits/:id/pdf', asyncHandler(async (req, res) => {
  const tenant = await getTenantData(req.tenant.id);

  const [rows] = await db.query(
    `SELECT v.*, f.name as farm_name, CONCAT(u.first_name, ' ', u.last_name) as vet_name
     FROM rv_farm_visit v
     LEFT JOIN rv_farm f ON v.farm_id = f.id
     LEFT JOIN rv_users u ON v.vet_user_id = u.id
     WHERE v.id = ? AND v.tenant_id = ?`,
    [req.params.id, req.tenant.id]
  );

  if (!rows.length) {
    return res.status(404).json({ success: false, message: 'Visit not found' });
  }

  const visit = rows[0];
  const buffer = await generateFarmVisitReportPDF(visit, tenant);

  // Update report_url on the visit record
  const reportPath = `farm-visit-report-${req.params.id}.pdf`;
  await db.query(
    'UPDATE rv_farm_visit SET report_url = ? WHERE id = ? AND tenant_id = ?',
    [reportPath, req.params.id, req.tenant.id]
  );

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="${reportPath}"`,
    'Content-Length': buffer.length
  });
  res.send(buffer);
}));

module.exports = router;
