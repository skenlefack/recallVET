const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const asyncHandler = require('../../utils/asyncHandler');
const { generateCSV } = require('../../services/exportService');

// GET /api/v1/exports/animals
router.get('/animals', asyncHandler(async (req, res) => {
  const { search, species_id } = req.query;
  let where = 'WHERE a.tenant_id = ?';
  const params = [req.tenant.id];
  if (search) { where += ' AND (a.name LIKE ? OR a.animal_code LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (species_id) { where += ' AND a.species_id = ?'; params.push(species_id); }

  const [rows] = await db.query(
    `SELECT a.animal_code, a.name, sp.name_fr as species, b.name as breed,
            p.display_name as owner, a.sex, a.date_of_birth as dob, a.microchip_number as microchip, a.status
     FROM rv_animal a
     LEFT JOIN rv_species sp ON a.species_id = sp.id
     LEFT JOIN rv_breed b ON a.breed_id = b.id
     LEFT JOIN rv_party p ON a.owner_party_id = p.id
     ${where} ORDER BY a.name`, params);

  const columns = [
    { header: 'Animal Code', key: 'animal_code' },
    { header: 'Name', key: 'name' },
    { header: 'Species', key: 'species' },
    { header: 'Breed', key: 'breed' },
    { header: 'Owner', key: 'owner' },
    { header: 'Sex', key: 'sex' },
    { header: 'Date of Birth', key: 'dob' },
    { header: 'Microchip', key: 'microchip' },
    { header: 'Status', key: 'status' }
  ];

  const csv = generateCSV(columns, rows);
  res.set({
    'Content-Type': 'text/csv',
    'Content-Disposition': 'attachment; filename="animals.csv"'
  });
  res.send(csv);
}));

// GET /api/v1/exports/parties
router.get('/parties', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT client_code, display_name, party_type as type, phone_primary as phone,
            email, city, country, status
     FROM rv_party WHERE tenant_id = ? ORDER BY display_name`, [req.tenant.id]);

  const columns = [
    { header: 'Client Code', key: 'client_code' },
    { header: 'Name', key: 'display_name' },
    { header: 'Type', key: 'type' },
    { header: 'Phone', key: 'phone' },
    { header: 'Email', key: 'email' },
    { header: 'City', key: 'city' },
    { header: 'Country', key: 'country' },
    { header: 'Status', key: 'status' }
  ];

  const csv = generateCSV(columns, rows);
  res.set({
    'Content-Type': 'text/csv',
    'Content-Disposition': 'attachment; filename="parties.csv"'
  });
  res.send(csv);
}));

// GET /api/v1/exports/invoices
router.get('/invoices', asyncHandler(async (req, res) => {
  const { status, date_from, date_to } = req.query;
  let where = 'WHERE i.tenant_id = ?';
  const params = [req.tenant.id];
  if (status) { where += ' AND i.status = ?'; params.push(status); }
  if (date_from) { where += ' AND i.invoice_date >= ?'; params.push(date_from); }
  if (date_to) { where += ' AND i.invoice_date <= ?'; params.push(date_to); }

  const [rows] = await db.query(
    `SELECT i.invoice_number, i.invoice_date as date, p.display_name as party,
            i.subtotal, i.discount_amount as discount, i.tax_amount as tax, i.total_amount as total, i.status
     FROM rv_invoice i
     LEFT JOIN rv_party p ON i.party_id = p.id
     ${where} ORDER BY i.invoice_date DESC`, params);

  const columns = [
    { header: 'Invoice Number', key: 'invoice_number' },
    { header: 'Date', key: 'date' },
    { header: 'Party', key: 'party' },
    { header: 'Subtotal', key: 'subtotal' },
    { header: 'Discount', key: 'discount' },
    { header: 'Tax', key: 'tax' },
    { header: 'Total', key: 'total' },
    { header: 'Status', key: 'status' }
  ];

  const csv = generateCSV(columns, rows);
  res.set({
    'Content-Type': 'text/csv',
    'Content-Disposition': 'attachment; filename="invoices.csv"'
  });
  res.send(csv);
}));

// GET /api/v1/exports/stock
router.get('/stock', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT pr.name as product, pr.sku, c.name as category,
            COALESCE(SUM(sl.quantity_on_hand), 0) as total_on_hand,
            pr.reorder_level,
            MIN(sl.expiry_date) as earliest_expiry
     FROM rv_product pr
     LEFT JOIN rv_product_category c ON pr.category_id = c.id
     LEFT JOIN rv_stock_lot sl ON pr.id = sl.product_id AND sl.quantity_on_hand > 0
     WHERE pr.tenant_id = ?
     GROUP BY pr.id, pr.name, pr.sku, c.name, pr.reorder_level
     ORDER BY pr.name`, [req.tenant.id]);

  const columns = [
    { header: 'Product', key: 'product' },
    { header: 'SKU', key: 'sku' },
    { header: 'Category', key: 'category' },
    { header: 'Total On Hand', key: 'total_on_hand' },
    { header: 'Reorder Level', key: 'reorder_level' },
    { header: 'Earliest Expiry', key: 'earliest_expiry' }
  ];

  const csv = generateCSV(columns, rows);
  res.set({
    'Content-Type': 'text/csv',
    'Content-Disposition': 'attachment; filename="stock.csv"'
  });
  res.send(csv);
}));

// GET /api/v1/exports/sales
router.get('/sales', asyncHandler(async (req, res) => {
  const { date_from, date_to } = req.query;
  let where = 'WHERE s.tenant_id = ?';
  const params = [req.tenant.id];
  if (date_from) { where += ' AND s.sale_date >= ?'; params.push(date_from); }
  if (date_to) { where += ' AND s.sale_date <= ?'; params.push(date_to); }

  const [rows] = await db.query(
    `SELECT s.sale_number, s.sale_date as date, p.display_name as party,
            s.subtotal, s.discount_amount as discount, s.tax_amount as tax,
            s.total_amount as total, s.payment_method, s.status
     FROM rv_sale s
     LEFT JOIN rv_party p ON s.party_id = p.id
     ${where} ORDER BY s.sale_date DESC`, params);

  const columns = [
    { header: 'Sale Number', key: 'sale_number' },
    { header: 'Date', key: 'date' },
    { header: 'Party', key: 'party' },
    { header: 'Subtotal', key: 'subtotal' },
    { header: 'Discount', key: 'discount' },
    { header: 'Tax', key: 'tax' },
    { header: 'Total', key: 'total' },
    { header: 'Payment Method', key: 'payment_method' },
    { header: 'Status', key: 'status' }
  ];

  const csv = generateCSV(columns, rows);
  res.set({
    'Content-Type': 'text/csv',
    'Content-Disposition': 'attachment; filename="sales.csv"'
  });
  res.send(csv);
}));

module.exports = router;
