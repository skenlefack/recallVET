const PDFDocument = require('pdfkit');

/**
 * Helper: pipe a PDFDocument to a buffer and return as Promise<Buffer>.
 */
function pdfToBuffer(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });
}

/**
 * Draw a simple table with borders.
 * @param {PDFDocument} doc
 * @param {number} startX
 * @param {number} startY
 * @param {Array<{label:string, width:number, align?:string}>} columns
 * @param {Array<Array<string>>} rows
 * @returns {number} y position after table
 */
function drawTable(doc, startX, startY, columns, rows) {
  const rowHeight = 20;
  const headerHeight = 22;
  const tableWidth = columns.reduce((sum, c) => sum + c.width, 0);

  // Header background
  doc.fillColor('#2d6a4f').rect(startX, startY, tableWidth, headerHeight).fill();
  doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
  let x = startX;
  for (const col of columns) {
    doc.text(col.label, x + 4, startY + 6, { width: col.width - 8, align: col.align || 'left' });
    x += col.width;
  }

  // Rows
  doc.font('Helvetica').fontSize(8).fillColor('#000000');
  let y = startY + headerHeight;
  for (let r = 0; r < rows.length; r++) {
    // Alternate row bg
    if (r % 2 === 1) {
      doc.fillColor('#f0f0f0').rect(startX, y, tableWidth, rowHeight).fill();
      doc.fillColor('#000000');
    }
    // Row border
    doc.strokeColor('#cccccc').lineWidth(0.5)
      .moveTo(startX, y + rowHeight).lineTo(startX + tableWidth, y + rowHeight).stroke();

    x = startX;
    for (let c = 0; c < columns.length; c++) {
      doc.text(String(rows[r][c] ?? ''), x + 4, y + 5, { width: columns[c].width - 8, align: columns[c].align || 'left' });
      x += columns[c].width;
    }
    y += rowHeight;

    // New page if needed
    if (y > 720) {
      doc.addPage();
      y = 50;
    }
  }

  // Outer border
  doc.strokeColor('#2d6a4f').lineWidth(1)
    .rect(startX, startY, tableWidth, headerHeight + rows.length * rowHeight).stroke();

  return y + 10;
}

function addHeader(doc, tenantData, title) {
  doc.fontSize(18).font('Helvetica-Bold').fillColor('#2d6a4f')
    .text(tenantData.name || 'Clinic', 50, 40);
  if (tenantData.address) {
    doc.fontSize(8).font('Helvetica').fillColor('#666666')
      .text(tenantData.address, 50, 62);
  }
  if (tenantData.phone || tenantData.email) {
    doc.text([tenantData.phone, tenantData.email].filter(Boolean).join(' | '), 50, 74);
  }
  doc.moveTo(50, 90).lineTo(560, 90).strokeColor('#2d6a4f').lineWidth(1).stroke();

  doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000')
    .text(title, 50, 100, { align: 'center' });
  return 125;
}

function addFooter(doc, tenantData) {
  const bottom = 760;
  doc.moveTo(50, bottom).lineTo(560, bottom).strokeColor('#cccccc').lineWidth(0.5).stroke();
  doc.fontSize(7).font('Helvetica').fillColor('#999999')
    .text(`${tenantData.name || ''} - Generated on ${new Date().toLocaleDateString()}`, 50, bottom + 5, { align: 'center', width: 510 });
}

function fmt(v) {
  if (v == null) return '';
  if (typeof v === 'number') return v.toFixed(2);
  return String(v);
}

/**
 * Generate an invoice PDF.
 */
async function generateInvoicePDF(invoiceData, tenantData) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  let y = addHeader(doc, tenantData, 'INVOICE / FACTURE');

  // Invoice info
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000');
  doc.text(`Invoice #: ${invoiceData.invoice_number || ''}`, 50, y);
  doc.text(`Date: ${invoiceData.invoice_date ? new Date(invoiceData.invoice_date).toLocaleDateString() : ''}`, 350, y);
  y += 16;
  doc.font('Helvetica').fontSize(9);
  doc.text(`Client: ${invoiceData.party_name || ''}`, 50, y);
  if (invoiceData.due_date) {
    doc.text(`Due: ${new Date(invoiceData.due_date).toLocaleDateString()}`, 350, y);
  }
  y += 16;
  doc.text(`Status: ${(invoiceData.status || '').toUpperCase()}`, 50, y);
  y += 25;

  // Line items table
  const columns = [
    { label: 'Description', width: 180 },
    { label: 'Qty', width: 45, align: 'right' },
    { label: 'Unit Price', width: 70, align: 'right' },
    { label: 'Discount %', width: 65, align: 'right' },
    { label: 'Tax %', width: 55, align: 'right' },
    { label: 'Total', width: 75, align: 'right' }
  ];
  const rows = (invoiceData.lines || []).map(l => [
    l.description || '',
    fmt(l.quantity),
    fmt(l.unit_price),
    fmt(l.discount_percent),
    fmt(l.tax_rate),
    fmt(l.line_total)
  ]);

  y = drawTable(doc, 50, y, columns, rows);

  // Totals
  y += 5;
  const totalsX = 380;
  doc.fontSize(9).font('Helvetica');
  doc.text('Subtotal:', totalsX, y); doc.text(fmt(invoiceData.subtotal), totalsX + 100, y, { align: 'right', width: 70 }); y += 16;
  doc.text('Discount:', totalsX, y); doc.text(fmt(invoiceData.discount_amount), totalsX + 100, y, { align: 'right', width: 70 }); y += 16;
  doc.text('Tax:', totalsX, y); doc.text(fmt(invoiceData.tax_amount), totalsX + 100, y, { align: 'right', width: 70 }); y += 16;
  doc.font('Helvetica-Bold').fontSize(11);
  doc.text('TOTAL:', totalsX, y); doc.text(fmt(invoiceData.total_amount), totalsX + 100, y, { align: 'right', width: 70 }); y += 20;

  // Payment status
  doc.font('Helvetica').fontSize(9);
  const statusColor = invoiceData.status === 'paid' ? '#2d6a4f' : '#cc0000';
  doc.fillColor(statusColor).text(`Payment Status: ${(invoiceData.status || 'draft').toUpperCase()}`, totalsX, y);

  // Payments
  if (invoiceData.payments && invoiceData.payments.length > 0) {
    y += 30;
    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(10).text('Payments', 50, y);
    y += 15;
    const payCols = [
      { label: 'Date', width: 120 },
      { label: 'Method', width: 100 },
      { label: 'Reference', width: 150 },
      { label: 'Amount', width: 100, align: 'right' }
    ];
    const payRows = invoiceData.payments.map(p => [
      p.payment_date ? new Date(p.payment_date).toLocaleDateString() : '',
      p.payment_method || '',
      p.payment_reference || '',
      fmt(p.amount)
    ]);
    y = drawTable(doc, 50, y, payCols, payRows);
  }

  addFooter(doc, tenantData);
  return pdfToBuffer(doc);
}

/**
 * Generate a prescription PDF.
 */
async function generatePrescriptionPDF(prescriptionData, tenantData) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  let y = addHeader(doc, tenantData, 'PRESCRIPTION / ORDONNANCE');

  doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000');
  doc.text(`Rx #: ${prescriptionData.prescription_number || ''}`, 50, y);
  doc.text(`Date: ${prescriptionData.prescription_date ? new Date(prescriptionData.prescription_date).toLocaleDateString() : ''}`, 350, y);
  y += 18;
  doc.font('Helvetica').fontSize(9);
  doc.text(`Animal: ${prescriptionData.animal_name || ''}`, 50, y);
  if (prescriptionData.species_name) {
    doc.text(`Species: ${prescriptionData.species_name}`, 250, y);
  }
  y += 14;
  doc.text(`Owner: ${prescriptionData.owner_name || ''}`, 50, y);
  y += 14;
  doc.text(`Prescriber: ${prescriptionData.prescriber_name || ''}`, 50, y);
  y += 14;
  if (prescriptionData.valid_until) {
    doc.text(`Valid until: ${new Date(prescriptionData.valid_until).toLocaleDateString()}`, 50, y);
    y += 14;
  }
  y += 10;

  // Prescription lines table
  const columns = [
    { label: 'Product', width: 120 },
    { label: 'Dosage', width: 70 },
    { label: 'Frequency', width: 70 },
    { label: 'Duration (days)', width: 75, align: 'right' },
    { label: 'Quantity', width: 55, align: 'right' },
    { label: 'Instructions', width: 120 }
  ];
  const rows = (prescriptionData.lines || []).map(l => [
    l.product_name || '',
    [l.dosage, l.dosage_unit].filter(Boolean).join(' '),
    l.frequency || '',
    l.duration_days != null ? String(l.duration_days) : '',
    l.quantity != null ? String(l.quantity) : '',
    l.instructions || ''
  ]);

  y = drawTable(doc, 50, y, columns, rows);

  // Notes
  if (prescriptionData.notes) {
    y += 10;
    doc.font('Helvetica-Bold').fontSize(9).text('Notes:', 50, y);
    y += 14;
    doc.font('Helvetica').fontSize(9).text(prescriptionData.notes, 50, y, { width: 500 });
  }

  addFooter(doc, tenantData);
  return pdfToBuffer(doc);
}

/**
 * Generate a vaccination certificate PDF.
 */
async function generateVaccinationCertificatePDF(vaccinationData, tenantData) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  let y = addHeader(doc, tenantData, 'VACCINATION CERTIFICATE / CERTIFICAT DE VACCINATION');

  // Animal info
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#2d6a4f').text('Animal Information', 50, y);
  y += 18;
  doc.fontSize(9).font('Helvetica').fillColor('#000000');
  const animalInfo = [
    ['Name', vaccinationData.animal_name],
    ['Species', vaccinationData.species_name],
    ['Breed', vaccinationData.breed_name],
    ['Microchip', vaccinationData.microchip_number],
    ['Owner', vaccinationData.owner_name]
  ];
  for (const [label, value] of animalInfo) {
    if (value) {
      doc.font('Helvetica-Bold').text(`${label}: `, 50, y, { continued: true });
      doc.font('Helvetica').text(value);
      y += 14;
    }
  }

  y += 10;
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#2d6a4f').text('Vaccination Details', 50, y);
  y += 18;
  doc.fillColor('#000000');

  const vaccInfo = [
    ['Vaccine', vaccinationData.product_name],
    ['Lot Number', vaccinationData.lot_number],
    ['Batch Number', vaccinationData.batch_number],
    ['Date', vaccinationData.vaccination_date ? new Date(vaccinationData.vaccination_date).toLocaleDateString() : ''],
    ['Dose Number', vaccinationData.dose_number != null ? String(vaccinationData.dose_number) : ''],
    ['Route', vaccinationData.route],
    ['Next Due Date', vaccinationData.next_due_date ? new Date(vaccinationData.next_due_date).toLocaleDateString() : ''],
    ['Administered By', vaccinationData.vet_name]
  ];

  doc.fontSize(9);
  for (const [label, value] of vaccInfo) {
    if (value) {
      doc.font('Helvetica-Bold').text(`${label}: `, 50, y, { continued: true });
      doc.font('Helvetica').text(value);
      y += 14;
    }
  }

  if (vaccinationData.certificate_number) {
    y += 10;
    doc.font('Helvetica-Bold').fontSize(10)
      .text(`Certificate #: ${vaccinationData.certificate_number}`, 50, y);
  }

  // Notes
  if (vaccinationData.notes) {
    y += 20;
    doc.font('Helvetica-Bold').fontSize(9).text('Notes:', 50, y);
    y += 14;
    doc.font('Helvetica').fontSize(9).text(vaccinationData.notes, 50, y, { width: 500 });
  }

  // Signature area
  y = Math.max(y + 60, 600);
  doc.moveTo(350, y).lineTo(540, y).strokeColor('#000000').lineWidth(0.5).stroke();
  doc.fontSize(8).text('Veterinarian Signature', 350, y + 5, { width: 190, align: 'center' });

  addFooter(doc, tenantData);
  return pdfToBuffer(doc);
}

/**
 * Generate a farm visit report PDF.
 */
async function generateFarmVisitReportPDF(visit, tenantData) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  let y = addHeader(doc, tenantData, 'RAPPORT DE VISITE / FARM VISIT REPORT');

  // Visit info
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000');
  doc.text(`Farm: ${visit.farm_name || ''}`, 50, y);
  doc.text(`Date: ${visit.visit_date ? new Date(visit.visit_date).toLocaleDateString() : ''}`, 350, y);
  y += 16;
  doc.font('Helvetica').fontSize(9);
  doc.text(`Veterinarian: ${visit.vet_name || ''}`, 50, y);
  doc.text(`Visit Type: ${(visit.visit_type || '').replace(/_/g, ' ')}`, 350, y);
  y += 16;
  doc.text(`Status: ${(visit.status || '').toUpperCase()}`, 50, y);
  y += 25;

  // General findings
  if (visit.general_findings) {
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#2d6a4f').text('General Findings / Constatations', 50, y);
    y += 16;
    doc.fontSize(9).font('Helvetica').fillColor('#000000')
      .text(visit.general_findings, 50, y, { width: 500 });
    y = doc.y + 15;
  }

  // Recommendations
  if (visit.recommendations) {
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#2d6a4f').text('Recommendations / Recommandations', 50, y);
    y += 16;
    doc.fontSize(9).font('Helvetica').fillColor('#000000')
      .text(visit.recommendations, 50, y, { width: 500 });
    y = doc.y + 15;
  }

  // Treatments table (if provided)
  if (visit.treatments && visit.treatments.length > 0) {
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#2d6a4f').text('Treatments / Traitements', 50, y);
    y += 16;
    const columns = [
      { label: 'Treatment', width: 180 },
      { label: 'Animals', width: 80, align: 'right' },
      { label: 'Product', width: 120 },
      { label: 'Notes', width: 130 }
    ];
    const rows = visit.treatments.map(tr => [
      tr.description || tr.treatment_type || '',
      tr.animal_count != null ? String(tr.animal_count) : '',
      tr.product_name || '',
      tr.notes || ''
    ]);
    y = drawTable(doc, 50, y, columns, rows);
  }

  // Follow-up
  if (visit.follow_up_date || visit.follow_up_notes) {
    y += 5;
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#2d6a4f').text('Follow-up / Suivi', 50, y);
    y += 16;
    doc.fontSize(9).font('Helvetica').fillColor('#000000');
    if (visit.follow_up_date) {
      doc.font('Helvetica-Bold').text('Next Visit: ', 50, y, { continued: true });
      doc.font('Helvetica').text(new Date(visit.follow_up_date).toLocaleDateString());
      y += 14;
    }
    if (visit.follow_up_notes) {
      doc.text(visit.follow_up_notes, 50, y, { width: 500 });
      y = doc.y + 10;
    }
  }

  // Signature area
  y = Math.max(y + 40, 620);
  doc.moveTo(350, y).lineTo(540, y).strokeColor('#000000').lineWidth(0.5).stroke();
  doc.fontSize(8).text('Veterinarian Signature', 350, y + 5, { width: 190, align: 'center' });

  addFooter(doc, tenantData);
  return pdfToBuffer(doc);
}

module.exports = {
  generateInvoicePDF,
  generatePrescriptionPDF,
  generateVaccinationCertificatePDF,
  generateFarmVisitReportPDF
};
