const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const asyncHandler = require('../../utils/asyncHandler');

// Map store names to DB tables and their columns
const STORE_CONFIG = {
  animals: {
    table: 'rv_animal',
    select: `a.*, s.name_fr as species_name, b.name_fr as breed_name, p.display_name as owner_name`,
    joins: `a LEFT JOIN rv_species s ON a.species_id = s.id
            LEFT JOIN rv_breed b ON a.breed_id = b.id
            LEFT JOIN rv_party p ON a.owner_party_id = p.id`,
    alias: 'a'
  },
  parties: {
    table: 'rv_party',
    select: 'p.*',
    joins: 'p',
    alias: 'p'
  },
  appointments: {
    table: 'rv_appointment',
    select: `a.*, an.name as animal_name, p.display_name as party_name`,
    joins: `a LEFT JOIN rv_animal an ON a.animal_id = an.id
            LEFT JOIN rv_party p ON a.party_id = p.id`,
    alias: 'a'
  },
  encounters: {
    table: 'rv_encounter',
    select: `e.*, an.name as animal_name, p.display_name as party_name`,
    joins: `e LEFT JOIN rv_animal an ON e.animal_id = an.id
            LEFT JOIN rv_party p ON e.party_id = p.id`,
    alias: 'e'
  },
  prescriptions: {
    table: 'rv_prescription',
    select: `pr.*, an.name as animal_name`,
    joins: `pr LEFT JOIN rv_animal an ON pr.animal_id = an.id`,
    alias: 'pr'
  },
  invoices: {
    table: 'rv_invoice',
    select: `i.*, p.display_name as party_name`,
    joins: `i LEFT JOIN rv_party p ON i.party_id = p.id`,
    alias: 'i'
  },
  products: {
    table: 'rv_product',
    select: 'p.*',
    joins: 'p',
    alias: 'p'
  }
};

/**
 * GET /api/v1/sync/changes?store=animals&since=2026-10-14T12:00:00Z
 * Returns records modified since the given timestamp for the tenant.
 * If no `since`, returns all records (initial sync).
 */
router.get('/changes', asyncHandler(async (req, res) => {
  const { store, since } = req.query;
  const tenantId = req.tenant.id;

  if (!store || !STORE_CONFIG[store]) {
    return res.status(400).json({
      success: false,
      message: `Invalid store. Valid stores: ${Object.keys(STORE_CONFIG).join(', ')}`
    });
  }

  const config = STORE_CONFIG[store];
  const syncTimestamp = new Date().toISOString();

  let where = `${config.alias}.tenant_id = ?`;
  const params = [tenantId];

  if (since) {
    where += ` AND ${config.alias}.updated_at > ?`;
    params.push(since);
  }

  // Limit to 500 records per sync to avoid huge payloads
  const [rows] = await db.query(
    `SELECT ${config.select}
     FROM ${config.table} ${config.joins !== config.alias ? config.joins : config.alias}
     WHERE ${where}
     ORDER BY ${config.alias}.updated_at ASC
     LIMIT 500`,
    params
  );

  res.json({
    success: true,
    data: rows,
    syncTimestamp,
    hasMore: rows.length === 500
  });
}));

module.exports = router;
