const express = require('express');
const router = express.Router();
const db = require('../../../config/db');
const asyncHandler = require('../../../utils/asyncHandler');
const { generateInvoicePDF, generatePrescriptionPDF, generateVaccinationCertificatePDF } = require('../../../services/pdfService');

/**
 * Fetch tenant data for PDF headers.
 */
async function getTenantData(tenantId) {
  const [rows] = await db.query('SELECT * FROM rv_tenant WHERE id = ?', [tenantId]);
  return rows[0] || { name: 'Clinic' };
}

// GET /api/v1/clinic/exports/invoices/:id/pdf
router.get('/invoices/:id/pdf', asyncHandler(async (req, res) => {
  const tenant = await getTenantData(req.tenant.id);
  const [rows] = await db.query(
    `SELECT i.*, p.display_name as party_name, p.phone_primary, p.email
     FROM rv_invoice i LEFT JOIN rv_party p ON i.party_id = p.id
     WHERE i.id = ? AND i.tenant_id = ?`, [req.params.id, req.tenant.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Invoice not found' });

  const [lines] = await db.query('SELECT * FROM rv_invoice_line WHERE invoice_id = ?', [req.params.id]);
  const [payments] = await db.query('SELECT * FROM rv_payment WHERE invoice_id = ? ORDER BY payment_date', [req.params.id]);

  const invoiceData = { ...rows[0], lines, payments };
  const buffer = await generateInvoicePDF(invoiceData, tenant);

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="invoice-${invoiceData.invoice_number || req.params.id}.pdf"`,
    'Content-Length': buffer.length
  });
  res.send(buffer);
}));

// GET /api/v1/clinic/exports/prescriptions/:id/pdf
router.get('/prescriptions/:id/pdf', asyncHandler(async (req, res) => {
  const tenant = await getTenantData(req.tenant.id);
  const [rows] = await db.query(
    `SELECT rx.*, a.name as animal_name, a.animal_code, sp.name_fr as species_name,
            p.display_name as owner_name, CONCAT(u.first_name, ' ', u.last_name) as prescriber_name
     FROM rv_prescription rx
     LEFT JOIN rv_animal a ON rx.animal_id = a.id
     LEFT JOIN rv_species sp ON a.species_id = sp.id
     LEFT JOIN rv_party p ON rx.party_id = p.id
     LEFT JOIN rv_users u ON rx.prescriber_user_id = u.id
     WHERE rx.id = ? AND rx.tenant_id = ?`, [req.params.id, req.tenant.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Prescription not found' });

  const [lines] = await db.query('SELECT * FROM rv_prescription_line WHERE prescription_id = ?', [req.params.id]);

  const prescriptionData = { ...rows[0], lines };
  const buffer = await generatePrescriptionPDF(prescriptionData, tenant);

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="prescription-${prescriptionData.prescription_number || req.params.id}.pdf"`,
    'Content-Length': buffer.length
  });
  res.send(buffer);
}));

// GET /api/v1/clinic/exports/vaccinations/:id/certificate
router.get('/vaccinations/:id/certificate', asyncHandler(async (req, res) => {
  const tenant = await getTenantData(req.tenant.id);
  const [rows] = await db.query(
    `SELECT v.*, a.name as animal_name, a.animal_code, a.microchip_number,
            sp.name_fr as species_name, b.name as breed_name,
            p.display_name as owner_name, CONCAT(u.first_name, ' ', u.last_name) as vet_name
     FROM rv_vaccination_event v
     LEFT JOIN rv_animal a ON v.animal_id = a.id
     LEFT JOIN rv_species sp ON a.species_id = sp.id
     LEFT JOIN rv_breed b ON a.breed_id = b.id
     LEFT JOIN rv_party p ON a.owner_party_id = p.id
     LEFT JOIN rv_users u ON v.administered_by = u.id
     WHERE v.id = ? AND v.tenant_id = ?`, [req.params.id, req.tenant.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Vaccination not found' });

  const buffer = await generateVaccinationCertificatePDF(rows[0], tenant);

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="vaccination-certificate-${req.params.id}.pdf"`,
    'Content-Length': buffer.length
  });
  res.send(buffer);
}));

module.exports = router;
