const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const validate = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const db = require('../../config/db');
const { checkPlanLimit } = require('../../middleware/planLimits');

// Multer config for logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/logos');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `tenant_${req.tenant.id}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed.'));
    }
  }
});

// GET /api/v1/tenant — Get current tenant details
router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT id, name, slug, logo_url, address_line, city, region, country_code,
            phone, default_currency, default_language, timezone
     FROM rv_tenant WHERE id = ?`,
    [req.tenant.id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Tenant not found.' });
  }

  res.json({ success: true, data: rows[0] });
}));

// PUT /api/v1/tenant — Update tenant settings (owner/admin only)
router.put('/', [
  body('name').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Name must be between 1 and 255 characters'),
  body('phone').optional({ nullable: true }).trim().isLength({ max: 30 }).withMessage('Phone must be at most 30 characters'),
  body('address_line').optional({ nullable: true }).trim().isLength({ max: 255 }).withMessage('Address must be at most 255 characters'),
  body('city').optional({ nullable: true }).trim().isLength({ max: 100 }).withMessage('City must be at most 100 characters'),
  body('region').optional({ nullable: true }).trim().isLength({ max: 100 }).withMessage('Region must be at most 100 characters'),
  body('country_code').optional({ nullable: true }).trim().isLength({ min: 2, max: 3 }).withMessage('Country code must be 2-3 characters'),
  body('default_currency').optional().isIn(['XAF', 'XOF', 'USD', 'EUR', 'GBP']).withMessage('Invalid currency'),
  body('default_language').optional().isIn(['fr', 'en']).withMessage('Language must be fr or en'),
  body('timezone').optional().trim().isLength({ max: 50 }).withMessage('Timezone must be at most 50 characters'),
  validate
], asyncHandler(async (req, res) => {
  // Only owner or admin can update tenant settings
  if (!['owner', 'admin'].includes(req.rvRole)) {
    return res.status(403).json({ success: false, message: 'Only owner or admin can update tenant settings.' });
  }

  const allowedFields = ['name', 'phone', 'address_line', 'city', 'region', 'country_code', 'default_currency', 'default_language', 'timezone'];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'No fields to update.' });
  }

  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values = Object.values(updates);

  await db.query(
    `UPDATE rv_tenant SET ${setClauses}, updated_at = NOW() WHERE id = ?`,
    [...values, req.tenant.id]
  );

  res.json({ success: true, message: 'Tenant settings updated.' });
}));

// POST /api/v1/tenant/logo — Upload tenant logo (owner/admin only)
router.post('/logo', (req, res, next) => {
  if (!['owner', 'admin'].includes(req.rvRole)) {
    return res.status(403).json({ success: false, message: 'Only owner or admin can upload the logo.' });
  }
  next();
}, upload.single('logo'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  const logoUrl = `/uploads/logos/${req.file.filename}`;

  // Get old logo to clean up
  const [rows] = await db.query('SELECT logo_url FROM rv_tenant WHERE id = ?', [req.tenant.id]);
  if (rows.length > 0 && rows[0].logo_url) {
    const oldPath = path.join(__dirname, '../../', rows[0].logo_url);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  await db.query(
    'UPDATE rv_tenant SET logo_url = ?, updated_at = NOW() WHERE id = ?',
    [logoUrl, req.tenant.id]
  );

  res.json({ success: true, message: 'Logo uploaded.', data: { logo_url: logoUrl } });
}));

// ── Structures CRUD ──

// GET /api/v1/tenant/structures
router.get('/structures', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM rv_structure WHERE tenant_id = ? ORDER BY name',
    [req.tenant.id]
  );
  res.json({ success: true, data: rows });
}));

// POST /api/v1/tenant/structures
router.post('/structures', checkPlanLimit('structures'), [
  body('name').trim().notEmpty().withMessage('Structure name is required.'),
  body('type').optional().isIn(['clinic', 'pharmacy', 'farm_practice', 'mixed']),
  body('address').optional({ nullable: true }).trim(),
  body('phone').optional({ nullable: true }).trim().isLength({ max: 30 }),
  body('email').optional({ nullable: true }).isEmail(),
  validate
], asyncHandler(async (req, res) => {
  if (!['owner', 'admin'].includes(req.rvRole)) {
    return res.status(403).json({ success: false, message: 'Only owner or admin can manage structures.' });
  }
  const { name, type, address, phone, email } = req.body;
  const [result] = await db.query(
    'INSERT INTO rv_structure (tenant_id, name, type, address, phone, email) VALUES (?, ?, ?, ?, ?, ?)',
    [req.tenant.id, name, type || 'mixed', address || null, phone || null, email || null]
  );
  res.status(201).json({ success: true, data: { id: result.insertId } });
}));

// PUT /api/v1/tenant/structures/:id
router.put('/structures/:id', [
  body('name').optional().trim().notEmpty(),
  body('type').optional().isIn(['clinic', 'pharmacy', 'farm_practice', 'mixed']),
  body('address').optional({ nullable: true }).trim(),
  body('phone').optional({ nullable: true }).trim().isLength({ max: 30 }),
  body('email').optional({ nullable: true }).isEmail(),
  validate
], asyncHandler(async (req, res) => {
  if (!['owner', 'admin'].includes(req.rvRole)) {
    return res.status(403).json({ success: false, message: 'Only owner or admin can manage structures.' });
  }
  // Verify structure belongs to tenant
  const [existing] = await db.query(
    'SELECT id FROM rv_structure WHERE id = ? AND tenant_id = ?',
    [req.params.id, req.tenant.id]
  );
  if (!existing.length) {
    return res.status(404).json({ success: false, message: 'Structure not found.' });
  }
  const allowedFields = ['name', 'type', 'address', 'phone', 'email', 'is_active'];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'No fields to update.' });
  }
  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  await db.query(
    `UPDATE rv_structure SET ${setClauses}, updated_at = NOW() WHERE id = ? AND tenant_id = ?`,
    [...Object.values(updates), req.params.id, req.tenant.id]
  );
  res.json({ success: true, message: 'Structure updated.' });
}));

// ── Sites CRUD ──

// GET /api/v1/tenant/sites
router.get('/sites', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT s.*, st.name as structure_name
     FROM rv_site s
     JOIN rv_structure st ON s.structure_id = st.id
     WHERE st.tenant_id = ?
     ORDER BY st.name, s.name`,
    [req.tenant.id]
  );
  res.json({ success: true, data: rows });
}));

// POST /api/v1/tenant/sites
router.post('/sites', [
  body('name').trim().notEmpty().withMessage('Site name is required.'),
  body('structure_id').isInt({ min: 1 }).withMessage('structure_id is required.'),
  body('address').optional({ nullable: true }).trim(),
  body('phone').optional({ nullable: true }).trim().isLength({ max: 30 }),
  validate
], asyncHandler(async (req, res) => {
  if (!['owner', 'admin'].includes(req.rvRole)) {
    return res.status(403).json({ success: false, message: 'Only owner or admin can manage sites.' });
  }
  // Verify structure belongs to tenant
  const [struct] = await db.query(
    'SELECT id FROM rv_structure WHERE id = ? AND tenant_id = ?',
    [req.body.structure_id, req.tenant.id]
  );
  if (!struct.length) {
    return res.status(404).json({ success: false, message: 'Structure not found.' });
  }
  const { name, structure_id, address, phone } = req.body;
  const [result] = await db.query(
    'INSERT INTO rv_site (structure_id, name, address, phone) VALUES (?, ?, ?, ?)',
    [structure_id, name, address || null, phone || null]
  );
  res.status(201).json({ success: true, data: { id: result.insertId } });
}));

// PUT /api/v1/tenant/sites/:id
router.put('/sites/:id', [
  body('name').optional().trim().notEmpty(),
  body('address').optional({ nullable: true }).trim(),
  body('phone').optional({ nullable: true }).trim().isLength({ max: 30 }),
  validate
], asyncHandler(async (req, res) => {
  if (!['owner', 'admin'].includes(req.rvRole)) {
    return res.status(403).json({ success: false, message: 'Only owner or admin can manage sites.' });
  }
  // Verify site belongs to tenant via structure
  const [existing] = await db.query(
    `SELECT s.id FROM rv_site s
     JOIN rv_structure st ON s.structure_id = st.id
     WHERE s.id = ? AND st.tenant_id = ?`,
    [req.params.id, req.tenant.id]
  );
  if (!existing.length) {
    return res.status(404).json({ success: false, message: 'Site not found.' });
  }
  const allowedFields = ['name', 'address', 'phone', 'is_active'];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'No fields to update.' });
  }
  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  await db.query(
    `UPDATE rv_site SET ${setClauses} WHERE id = ?`,
    [...Object.values(updates), req.params.id]
  );
  res.json({ success: true, message: 'Site updated.' });
}));

// Multer error handler
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Maximum size is 2MB.' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.message === 'Only JPEG and PNG images are allowed.') {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

module.exports = router;
