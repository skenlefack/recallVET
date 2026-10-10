const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const validate = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const db = require('../../config/db');

// Multer config for file attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tenantId = req.tenant.id;
    const entityType = req.body.entity_type || 'general';
    const dir = path.join(__dirname, '../../uploads', String(tenantId), entityType);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// POST /api/v1/uploads — Upload a file attachment
router.post('/', upload.single('file'), [
  body('entity_type').trim().notEmpty().withMessage('entity_type is required'),
  body('entity_id').isInt({ min: 1 }).withMessage('entity_id must be a positive integer'),
  validate
], asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  const { entity_type, entity_id } = req.body;
  const storagePath = `uploads/${req.tenant.id}/${entity_type}/${req.file.filename}`;

  const [result] = await db.query(
    `INSERT INTO rv_attachment (tenant_id, entity_type, entity_id, original_name, filename, mime_type, size_bytes, storage_path, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.tenant.id,
      entity_type,
      entity_id,
      req.file.originalname,
      req.file.filename,
      req.file.mimetype,
      req.file.size,
      storagePath,
      req.user.id
    ]
  );

  res.status(201).json({
    success: true,
    message: 'File uploaded.',
    data: {
      id: result.insertId,
      original_name: req.file.originalname,
      filename: req.file.filename,
      mime_type: req.file.mimetype,
      size_bytes: req.file.size,
      storage_path: storagePath
    }
  });
}));

// GET /api/v1/uploads/:entityType/:entityId — List attachments for an entity
router.get('/:entityType/:entityId', [
  param('entityType').trim().notEmpty().withMessage('entityType is required'),
  param('entityId').isInt({ min: 1 }).withMessage('entityId must be a positive integer'),
  validate
], asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT a.id, a.original_name, a.filename, a.mime_type, a.size_bytes, a.storage_path, a.created_at,
            u.first_name AS uploaded_by_first, u.last_name AS uploaded_by_last
     FROM rv_attachment a
     LEFT JOIN rv_users u ON u.id = a.uploaded_by
     WHERE a.tenant_id = ? AND a.entity_type = ? AND a.entity_id = ?
     ORDER BY a.created_at DESC`,
    [req.tenant.id, req.params.entityType, req.params.entityId]
  );

  res.json({ success: true, data: rows });
}));

// GET /api/v1/uploads/file/:id — Download/serve a specific attachment
router.get('/file/:id', [
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  validate
], asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM rv_attachment WHERE id = ? AND tenant_id = ?',
    [req.params.id, req.tenant.id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Attachment not found.' });
  }

  const attachment = rows[0];
  const filePath = path.join(__dirname, '../../', attachment.storage_path);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'File not found on disk.' });
  }

  res.setHeader('Content-Type', attachment.mime_type);
  res.setHeader('Content-Disposition', `inline; filename="${attachment.original_name}"`);
  res.sendFile(filePath);
}));

// DELETE /api/v1/uploads/:id — Delete attachment (remove file + DB record)
router.delete('/:id', [
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  validate
], asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM rv_attachment WHERE id = ? AND tenant_id = ?',
    [req.params.id, req.tenant.id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Attachment not found.' });
  }

  const attachment = rows[0];
  const filePath = path.join(__dirname, '../../', attachment.storage_path);

  // Remove file from disk
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Remove DB record
  await db.query('DELETE FROM rv_attachment WHERE id = ?', [req.params.id]);

  res.json({ success: true, message: 'Attachment deleted.' });
}));

// Multer error handler
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

module.exports = router;
