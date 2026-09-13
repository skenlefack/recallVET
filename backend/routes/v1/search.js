const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * @swagger
 * /v1/search:
 *   get:
 *     summary: Global search across animals, parties, and products
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search term (minimum 2 characters)
 *     responses:
 *       200:
 *         description: Grouped search results
 */
router.get('/', asyncHandler(async (req, res) => {
  const { q } = req.query;
  const tenantId = req.tenant.id;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters.' });
  }

  const term = q.trim();
  const likeTerm = `%${term}%`;

  // Search animals, parties, and products in parallel
  const [animals, parties, products] = await Promise.all([
    searchAnimals(tenantId, term, likeTerm),
    searchParties(tenantId, term, likeTerm),
    searchProducts(tenantId, term, likeTerm)
  ]);

  res.json({
    success: true,
    data: { animals, parties, products }
  });
}));

async function searchAnimals(tenantId, term, likeTerm) {
  // Try FULLTEXT first
  const [rows] = await db.query(
    `SELECT id, name, animal_code, microchip_number,
            MATCH(name, animal_code, microchip_number) AGAINST(? IN BOOLEAN MODE) AS relevance
     FROM rv_animal
     WHERE tenant_id = ? AND MATCH(name, animal_code, microchip_number) AGAINST(? IN BOOLEAN MODE)
     ORDER BY relevance DESC LIMIT 10`,
    [term, tenantId, term]
  );

  if (rows.length > 0) {
    return rows.map(r => ({
      type: 'animal',
      id: r.id,
      label: r.name || r.animal_code,
      sublabel: r.microchip_number || r.animal_code
    }));
  }

  // LIKE fallback for partial matches
  const [fallback] = await db.query(
    `SELECT id, name, animal_code, microchip_number
     FROM rv_animal
     WHERE tenant_id = ? AND (name LIKE ? OR animal_code LIKE ? OR microchip_number LIKE ?)
     LIMIT 10`,
    [tenantId, likeTerm, likeTerm, likeTerm]
  );

  return fallback.map(r => ({
    type: 'animal',
    id: r.id,
    label: r.name || r.animal_code,
    sublabel: r.microchip_number || r.animal_code
  }));
}

async function searchParties(tenantId, term, likeTerm) {
  const [rows] = await db.query(
    `SELECT id, display_name, phone_primary, email,
            MATCH(display_name, phone_primary, email) AGAINST(? IN BOOLEAN MODE) AS relevance
     FROM rv_party
     WHERE tenant_id = ? AND MATCH(display_name, phone_primary, email) AGAINST(? IN BOOLEAN MODE)
     ORDER BY relevance DESC LIMIT 10`,
    [term, tenantId, term]
  );

  if (rows.length > 0) {
    return rows.map(r => ({
      type: 'party',
      id: r.id,
      label: r.display_name,
      sublabel: r.phone_primary || r.email
    }));
  }

  const [fallback] = await db.query(
    `SELECT id, display_name, phone_primary, email
     FROM rv_party
     WHERE tenant_id = ? AND (display_name LIKE ? OR phone_primary LIKE ? OR email LIKE ?)
     LIMIT 10`,
    [tenantId, likeTerm, likeTerm, likeTerm]
  );

  return fallback.map(r => ({
    type: 'party',
    id: r.id,
    label: r.display_name,
    sublabel: r.phone_primary || r.email
  }));
}

async function searchProducts(tenantId, term, likeTerm) {
  const [rows] = await db.query(
    `SELECT id, name, sku, barcode,
            MATCH(name, sku, barcode) AGAINST(? IN BOOLEAN MODE) AS relevance
     FROM rv_product
     WHERE tenant_id = ? AND MATCH(name, sku, barcode) AGAINST(? IN BOOLEAN MODE)
     ORDER BY relevance DESC LIMIT 10`,
    [term, tenantId, term]
  );

  if (rows.length > 0) {
    return rows.map(r => ({
      type: 'product',
      id: r.id,
      label: r.name,
      sublabel: r.sku || r.barcode
    }));
  }

  const [fallback] = await db.query(
    `SELECT id, name, sku, barcode
     FROM rv_product
     WHERE tenant_id = ? AND (name LIKE ? OR sku LIKE ? OR barcode LIKE ?)
     LIMIT 10`,
    [tenantId, likeTerm, likeTerm, likeTerm]
  );

  return fallback.map(r => ({
    type: 'product',
    id: r.id,
    label: r.name,
    sublabel: r.sku || r.barcode
  }));
}

module.exports = router;
