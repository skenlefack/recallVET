const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const asyncHandler = require('../../utils/asyncHandler');

// ============================================================
// SPECIES
// ============================================================

// GET /species — list global + tenant
router.get('/species', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM rv_species WHERE tenant_id IS NULL OR tenant_id = ? ORDER BY sort_order, name_fr',
    [req.tenant.id]
  );
  res.json({ success: true, data: rows });
}));

// POST /species — create tenant-specific
router.post('/species', asyncHandler(async (req, res) => {
  const { code, name_fr, name_en, category } = req.body;
  const [result] = await db.query(
    'INSERT INTO rv_species (tenant_id, code, name_fr, name_en, category) VALUES (?, ?, ?, ?, ?)',
    [req.tenant.id, code, name_fr, name_en || null, category || 'companion']
  );
  res.status(201).json({ success: true, data: { id: result.insertId } });
}));

// PUT /species/:id — update only tenant-owned
router.put('/species/:id', asyncHandler(async (req, res) => {
  const [existing] = await db.query('SELECT * FROM rv_species WHERE id = ?', [req.params.id]);
  if (!existing.length) return res.status(404).json({ success: false, message: 'Not found' });
  if (existing[0].tenant_id === null) return res.status(403).json({ success: false, message: 'Cannot edit global reference data' });
  if (existing[0].tenant_id !== req.tenant.id) return res.status(403).json({ success: false, message: 'Access denied' });

  const { code, name_fr, name_en, category, is_active, sort_order } = req.body;
  await db.query(
    'UPDATE rv_species SET code = COALESCE(?, code), name_fr = COALESCE(?, name_fr), name_en = COALESCE(?, name_en), category = COALESCE(?, category), is_active = COALESCE(?, is_active), sort_order = COALESCE(?, sort_order) WHERE id = ?',
    [code, name_fr, name_en, category, is_active, sort_order, req.params.id]
  );
  res.json({ success: true, message: 'Updated' });
}));

// DELETE /species/:id — delete only tenant-owned
router.delete('/species/:id', asyncHandler(async (req, res) => {
  const [result] = await db.query('DELETE FROM rv_species WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenant.id]);
  if (!result.affectedRows) return res.status(403).json({ success: false, message: 'Cannot delete global data or not found' });
  res.json({ success: true, message: 'Deleted' });
}));

// ============================================================
// BREEDS
// ============================================================

// GET /breeds — list global + tenant (optionally filter by species_id)
router.get('/breeds', asyncHandler(async (req, res) => {
  let query = 'SELECT * FROM rv_breed WHERE (tenant_id IS NULL OR tenant_id = ?)';
  const params = [req.tenant.id];
  if (req.query.species_id) {
    query += ' AND species_id = ?';
    params.push(req.query.species_id);
  }
  query += ' ORDER BY name_fr';
  const [rows] = await db.query(query, params);
  res.json({ success: true, data: rows });
}));

// POST /breeds — create tenant-specific
router.post('/breeds', asyncHandler(async (req, res) => {
  const { species_id, code, name_fr, name_en } = req.body;
  const [result] = await db.query(
    'INSERT INTO rv_breed (tenant_id, species_id, code, name_fr, name_en) VALUES (?, ?, ?, ?, ?)',
    [req.tenant.id, species_id, code, name_fr, name_en || null]
  );
  res.status(201).json({ success: true, data: { id: result.insertId } });
}));

// PUT /breeds/:id — update only tenant-owned
router.put('/breeds/:id', asyncHandler(async (req, res) => {
  const [existing] = await db.query('SELECT * FROM rv_breed WHERE id = ?', [req.params.id]);
  if (!existing.length) return res.status(404).json({ success: false, message: 'Not found' });
  if (existing[0].tenant_id === null) return res.status(403).json({ success: false, message: 'Cannot edit global reference data' });
  if (existing[0].tenant_id !== req.tenant.id) return res.status(403).json({ success: false, message: 'Access denied' });

  const { species_id, code, name_fr, name_en } = req.body;
  await db.query(
    'UPDATE rv_breed SET species_id = COALESCE(?, species_id), code = COALESCE(?, code), name_fr = COALESCE(?, name_fr), name_en = COALESCE(?, name_en) WHERE id = ?',
    [species_id, code, name_fr, name_en, req.params.id]
  );
  res.json({ success: true, message: 'Updated' });
}));

// DELETE /breeds/:id — delete only tenant-owned
router.delete('/breeds/:id', asyncHandler(async (req, res) => {
  const [result] = await db.query('DELETE FROM rv_breed WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenant.id]);
  if (!result.affectedRows) return res.status(403).json({ success: false, message: 'Cannot delete global data or not found' });
  res.json({ success: true, message: 'Deleted' });
}));

// ============================================================
// DISEASES
// ============================================================

// GET /diseases — list global + tenant
router.get('/diseases', asyncHandler(async (req, res) => {
  let query = 'SELECT * FROM rv_disease WHERE (tenant_id IS NULL OR tenant_id = ?)';
  const params = [req.tenant.id];
  if (req.query.category) {
    query += ' AND category = ?';
    params.push(req.query.category);
  }
  if (req.query.is_notifiable !== undefined) {
    query += ' AND is_notifiable = ?';
    params.push(req.query.is_notifiable);
  }
  query += ' ORDER BY name_fr';
  const [rows] = await db.query(query, params);
  res.json({ success: true, data: rows });
}));

// POST /diseases — create tenant-specific
router.post('/diseases', asyncHandler(async (req, res) => {
  const { code, name_fr, name_en, category, species_applicable, is_notifiable } = req.body;
  const [result] = await db.query(
    'INSERT INTO rv_disease (tenant_id, code, name_fr, name_en, category, species_applicable, is_notifiable) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.tenant.id, code, name_fr, name_en || null, category || 'other', species_applicable ? JSON.stringify(species_applicable) : null, is_notifiable || 0]
  );
  res.status(201).json({ success: true, data: { id: result.insertId } });
}));

// PUT /diseases/:id — update only tenant-owned
router.put('/diseases/:id', asyncHandler(async (req, res) => {
  const [existing] = await db.query('SELECT * FROM rv_disease WHERE id = ?', [req.params.id]);
  if (!existing.length) return res.status(404).json({ success: false, message: 'Not found' });
  if (existing[0].tenant_id === null) return res.status(403).json({ success: false, message: 'Cannot edit global reference data' });
  if (existing[0].tenant_id !== req.tenant.id) return res.status(403).json({ success: false, message: 'Access denied' });

  const { code, name_fr, name_en, category, species_applicable, is_notifiable, is_active } = req.body;
  await db.query(
    'UPDATE rv_disease SET code = COALESCE(?, code), name_fr = COALESCE(?, name_fr), name_en = COALESCE(?, name_en), category = COALESCE(?, category), species_applicable = COALESCE(?, species_applicable), is_notifiable = COALESCE(?, is_notifiable), is_active = COALESCE(?, is_active) WHERE id = ?',
    [code, name_fr, name_en, category, species_applicable ? JSON.stringify(species_applicable) : null, is_notifiable, is_active, req.params.id]
  );
  res.json({ success: true, message: 'Updated' });
}));

// DELETE /diseases/:id — delete only tenant-owned
router.delete('/diseases/:id', asyncHandler(async (req, res) => {
  const [result] = await db.query('DELETE FROM rv_disease WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenant.id]);
  if (!result.affectedRows) return res.status(403).json({ success: false, message: 'Cannot delete global data or not found' });
  res.json({ success: true, message: 'Deleted' });
}));

// ============================================================
// CLINICAL SIGNS
// ============================================================

// GET /clinical-signs — list global + tenant
router.get('/clinical-signs', asyncHandler(async (req, res) => {
  let query = 'SELECT * FROM rv_clinical_sign WHERE (tenant_id IS NULL OR tenant_id = ?)';
  const params = [req.tenant.id];
  if (req.query.category) {
    query += ' AND category = ?';
    params.push(req.query.category);
  }
  query += ' ORDER BY name_fr';
  const [rows] = await db.query(query, params);
  res.json({ success: true, data: rows });
}));

// POST /clinical-signs — create tenant-specific
router.post('/clinical-signs', asyncHandler(async (req, res) => {
  const { name_fr, name_en, category } = req.body;
  const [result] = await db.query(
    'INSERT INTO rv_clinical_sign (tenant_id, name_fr, name_en, category) VALUES (?, ?, ?, ?)',
    [req.tenant.id, name_fr, name_en || null, category || 'general']
  );
  res.status(201).json({ success: true, data: { id: result.insertId } });
}));

// PUT /clinical-signs/:id — update only tenant-owned
router.put('/clinical-signs/:id', asyncHandler(async (req, res) => {
  const [existing] = await db.query('SELECT * FROM rv_clinical_sign WHERE id = ?', [req.params.id]);
  if (!existing.length) return res.status(404).json({ success: false, message: 'Not found' });
  if (existing[0].tenant_id === null) return res.status(403).json({ success: false, message: 'Cannot edit global reference data' });
  if (existing[0].tenant_id !== req.tenant.id) return res.status(403).json({ success: false, message: 'Access denied' });

  const { name_fr, name_en, category, is_active } = req.body;
  await db.query(
    'UPDATE rv_clinical_sign SET name_fr = COALESCE(?, name_fr), name_en = COALESCE(?, name_en), category = COALESCE(?, category), is_active = COALESCE(?, is_active) WHERE id = ?',
    [name_fr, name_en, category, is_active, req.params.id]
  );
  res.json({ success: true, message: 'Updated' });
}));

// DELETE /clinical-signs/:id — delete only tenant-owned
router.delete('/clinical-signs/:id', asyncHandler(async (req, res) => {
  const [result] = await db.query('DELETE FROM rv_clinical_sign WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenant.id]);
  if (!result.affectedRows) return res.status(403).json({ success: false, message: 'Cannot delete global data or not found' });
  res.json({ success: true, message: 'Deleted' });
}));

// ============================================================
// VACCINE TYPES
// ============================================================

// GET /vaccine-types — list global + tenant
router.get('/vaccine-types', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM rv_vaccine_type WHERE tenant_id IS NULL OR tenant_id = ? ORDER BY name_fr',
    [req.tenant.id]
  );
  res.json({ success: true, data: rows });
}));

// POST /vaccine-types — create tenant-specific
router.post('/vaccine-types', asyncHandler(async (req, res) => {
  const { name_fr, name_en, species_applicable, protocol } = req.body;
  const [result] = await db.query(
    'INSERT INTO rv_vaccine_type (tenant_id, name_fr, name_en, species_applicable, protocol) VALUES (?, ?, ?, ?, ?)',
    [req.tenant.id, name_fr, name_en || null, species_applicable ? JSON.stringify(species_applicable) : null, protocol || null]
  );
  res.status(201).json({ success: true, data: { id: result.insertId } });
}));

// PUT /vaccine-types/:id — update only tenant-owned
router.put('/vaccine-types/:id', asyncHandler(async (req, res) => {
  const [existing] = await db.query('SELECT * FROM rv_vaccine_type WHERE id = ?', [req.params.id]);
  if (!existing.length) return res.status(404).json({ success: false, message: 'Not found' });
  if (existing[0].tenant_id === null) return res.status(403).json({ success: false, message: 'Cannot edit global reference data' });
  if (existing[0].tenant_id !== req.tenant.id) return res.status(403).json({ success: false, message: 'Access denied' });

  const { name_fr, name_en, species_applicable, protocol, is_active } = req.body;
  await db.query(
    'UPDATE rv_vaccine_type SET name_fr = COALESCE(?, name_fr), name_en = COALESCE(?, name_en), species_applicable = COALESCE(?, species_applicable), protocol = COALESCE(?, protocol), is_active = COALESCE(?, is_active) WHERE id = ?',
    [name_fr, name_en, species_applicable ? JSON.stringify(species_applicable) : null, protocol, is_active, req.params.id]
  );
  res.json({ success: true, message: 'Updated' });
}));

// DELETE /vaccine-types/:id — delete only tenant-owned
router.delete('/vaccine-types/:id', asyncHandler(async (req, res) => {
  const [result] = await db.query('DELETE FROM rv_vaccine_type WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenant.id]);
  if (!result.affectedRows) return res.status(403).json({ success: false, message: 'Cannot delete global data or not found' });
  res.json({ success: true, message: 'Deleted' });
}));

// ============================================================
// DIAGNOSIS CODES
// ============================================================

// GET /diagnosis-codes — list global + tenant
router.get('/diagnosis-codes', asyncHandler(async (req, res) => {
  let query = 'SELECT * FROM rv_diagnosis_code WHERE (tenant_id IS NULL OR tenant_id = ?)';
  const params = [req.tenant.id];
  if (req.query.category) {
    query += ' AND category = ?';
    params.push(req.query.category);
  }
  query += ' ORDER BY code';
  const [rows] = await db.query(query, params);
  res.json({ success: true, data: rows });
}));

// POST /diagnosis-codes — create tenant-specific
router.post('/diagnosis-codes', asyncHandler(async (req, res) => {
  const { code, name_fr, name_en, category } = req.body;
  const [result] = await db.query(
    'INSERT INTO rv_diagnosis_code (tenant_id, code, name_fr, name_en, category) VALUES (?, ?, ?, ?, ?)',
    [req.tenant.id, code, name_fr, name_en || null, category || null]
  );
  res.status(201).json({ success: true, data: { id: result.insertId } });
}));

// PUT /diagnosis-codes/:id — update only tenant-owned
router.put('/diagnosis-codes/:id', asyncHandler(async (req, res) => {
  const [existing] = await db.query('SELECT * FROM rv_diagnosis_code WHERE id = ?', [req.params.id]);
  if (!existing.length) return res.status(404).json({ success: false, message: 'Not found' });
  if (existing[0].tenant_id === null) return res.status(403).json({ success: false, message: 'Cannot edit global reference data' });
  if (existing[0].tenant_id !== req.tenant.id) return res.status(403).json({ success: false, message: 'Access denied' });

  const { code, name_fr, name_en, category, is_active } = req.body;
  await db.query(
    'UPDATE rv_diagnosis_code SET code = COALESCE(?, code), name_fr = COALESCE(?, name_fr), name_en = COALESCE(?, name_en), category = COALESCE(?, category), is_active = COALESCE(?, is_active) WHERE id = ?',
    [code, name_fr, name_en, category, is_active, req.params.id]
  );
  res.json({ success: true, message: 'Updated' });
}));

// DELETE /diagnosis-codes/:id — delete only tenant-owned
router.delete('/diagnosis-codes/:id', asyncHandler(async (req, res) => {
  const [result] = await db.query('DELETE FROM rv_diagnosis_code WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenant.id]);
  if (!result.affectedRows) return res.status(403).json({ success: false, message: 'Cannot delete global data or not found' });
  res.json({ success: true, message: 'Deleted' });
}));

// ============================================================
// UNITS
// ============================================================

// GET /units — list global + tenant
router.get('/units', asyncHandler(async (req, res) => {
  let query = 'SELECT * FROM rv_unit WHERE (tenant_id IS NULL OR tenant_id = ?)';
  const params = [req.tenant.id];
  if (req.query.category) {
    query += ' AND category = ?';
    params.push(req.query.category);
  }
  query += ' ORDER BY category, name_fr';
  const [rows] = await db.query(query, params);
  res.json({ success: true, data: rows });
}));

// POST /units — create tenant-specific
router.post('/units', asyncHandler(async (req, res) => {
  const { code, name_fr, name_en, category } = req.body;
  const [result] = await db.query(
    'INSERT INTO rv_unit (tenant_id, code, name_fr, name_en, category) VALUES (?, ?, ?, ?, ?)',
    [req.tenant.id, code, name_fr, name_en || null, category || 'count']
  );
  res.status(201).json({ success: true, data: { id: result.insertId } });
}));

// PUT /units/:id — update only tenant-owned
router.put('/units/:id', asyncHandler(async (req, res) => {
  const [existing] = await db.query('SELECT * FROM rv_unit WHERE id = ?', [req.params.id]);
  if (!existing.length) return res.status(404).json({ success: false, message: 'Not found' });
  if (existing[0].tenant_id === null) return res.status(403).json({ success: false, message: 'Cannot edit global reference data' });
  if (existing[0].tenant_id !== req.tenant.id) return res.status(403).json({ success: false, message: 'Access denied' });

  const { code, name_fr, name_en, category, is_active } = req.body;
  await db.query(
    'UPDATE rv_unit SET code = COALESCE(?, code), name_fr = COALESCE(?, name_fr), name_en = COALESCE(?, name_en), category = COALESCE(?, category), is_active = COALESCE(?, is_active) WHERE id = ?',
    [code, name_fr, name_en, category, is_active, req.params.id]
  );
  res.json({ success: true, message: 'Updated' });
}));

// DELETE /units/:id — delete only tenant-owned
router.delete('/units/:id', asyncHandler(async (req, res) => {
  const [result] = await db.query('DELETE FROM rv_unit WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenant.id]);
  if (!result.affectedRows) return res.status(403).json({ success: false, message: 'Cannot delete global data or not found' });
  res.json({ success: true, message: 'Deleted' });
}));

// ============================================================
// DISEASE-SIGN MAPPINGS
// ============================================================

// GET /diseases/:id/signs — clinical signs linked to a disease
router.get('/diseases/:id/signs', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT cs.* FROM rv_clinical_sign cs
     JOIN rv_disease_sign ds ON cs.id = ds.clinical_sign_id
     WHERE ds.disease_id = ?`,
    [req.params.id]
  );
  res.json({ success: true, data: rows });
}));

// POST /diseases/:id/signs — link signs to a disease (body: { sign_ids: [1,2,3] })
router.post('/diseases/:id/signs', asyncHandler(async (req, res) => {
  const diseaseId = req.params.id;
  const { sign_ids } = req.body;
  if (!Array.isArray(sign_ids)) {
    return res.status(400).json({ success: false, message: 'sign_ids must be an array' });
  }

  await db.query('DELETE FROM rv_disease_sign WHERE disease_id = ?', [diseaseId]);

  if (sign_ids.length > 0) {
    const values = sign_ids.map(signId => [diseaseId, signId]);
    await db.query('INSERT INTO rv_disease_sign (disease_id, clinical_sign_id) VALUES ?', [values]);
  }

  res.json({ success: true, message: 'Signs updated' });
}));

// GET /suggestions?signs=1,2,3 — suggest diseases based on selected clinical signs
router.get('/suggestions', asyncHandler(async (req, res) => {
  const { signs } = req.query;
  if (!signs) {
    return res.status(400).json({ success: false, message: 'signs query parameter is required' });
  }

  const signIds = signs.split(',').map(Number).filter(n => !isNaN(n) && n > 0);
  if (!signIds.length) {
    return res.status(400).json({ success: false, message: 'Invalid sign IDs' });
  }

  const [rows] = await db.query(
    `SELECT d.*, COUNT(ds.clinical_sign_id) as match_count
     FROM rv_disease d
     JOIN rv_disease_sign ds ON d.id = ds.disease_id
     WHERE ds.clinical_sign_id IN (?)
     GROUP BY d.id
     ORDER BY match_count DESC
     LIMIT 10`,
    [signIds]
  );
  res.json({ success: true, data: rows });
}));

module.exports = router;
