const express = require('express');
const router = express.Router();
const db = require('../../../config/db');
const asyncHandler = require('../../../utils/asyncHandler');

// GET /api/v1/clinic/ref/species
router.get('/species', asyncHandler(async (req, res) => {
  const [species] = await db.query(
    'SELECT * FROM rv_species WHERE tenant_id IS NULL OR tenant_id = ? ORDER BY sort_order, name_fr',
    [req.tenant.id]
  );
  res.json({ success: true, data: species });
}));

// GET /api/v1/clinic/ref/breeds?species_id=
router.get('/breeds', asyncHandler(async (req, res) => {
  let query = 'SELECT * FROM rv_breed WHERE (tenant_id IS NULL OR tenant_id = ?)';
  const params = [req.tenant.id];
  if (req.query.species_id) {
    query += ' AND species_id = ?';
    params.push(req.query.species_id);
  }
  query += ' ORDER BY name_fr';
  const [breeds] = await db.query(query, params);
  res.json({ success: true, data: breeds });
}));

module.exports = router;
