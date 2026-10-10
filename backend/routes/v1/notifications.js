const express = require('express');
const router = express.Router();
const { query, param, body } = require('express-validator');
const validate = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const db = require('../../config/db');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} = require('../../services/notificationService');

// GET /api/v1/notifications — List notifications with pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validate
], asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await getNotifications(req.user.id, req.tenant.id, { page, limit });

  res.json({
    success: true,
    data: result.notifications,
    pagination: result.pagination
  });
}));

// GET /api/v1/notifications/unread-count — Get unread count
router.get('/unread-count', asyncHandler(async (req, res) => {
  const count = await getUnreadCount(req.user.id, req.tenant.id);
  res.json({ success: true, data: { count } });
}));

// PUT /api/v1/notifications/read-all — Mark all as read
router.put('/read-all', asyncHandler(async (req, res) => {
  const affected = await markAllAsRead(req.user.id, req.tenant.id);
  res.json({ success: true, data: { marked: affected } });
}));

// GET /api/v1/notifications/preferences — Get user notification preferences
router.get('/preferences', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    'SELECT id, event_type, channel, enabled FROM rv_notification_preference WHERE user_id = ? AND tenant_id = ?',
    [req.user.id, req.tenant.id]
  );
  res.json({ success: true, data: rows });
}));

// PUT /api/v1/notifications/preferences — Upsert notification preferences
router.put('/preferences', [
  body('preferences').isArray().withMessage('preferences must be an array'),
  body('preferences.*.event_type').notEmpty().withMessage('event_type is required'),
  body('preferences.*.channel').optional().isString(),
  body('preferences.*.enabled').isBoolean().withMessage('enabled must be a boolean'),
  validate
], asyncHandler(async (req, res) => {
  const { preferences } = req.body;

  for (const pref of preferences) {
    const channel = pref.channel || 'in_app';
    const [existing] = await db.query(
      'SELECT id FROM rv_notification_preference WHERE user_id = ? AND tenant_id = ? AND event_type = ? AND channel = ?',
      [req.user.id, req.tenant.id, pref.event_type, channel]
    );

    if (existing.length > 0) {
      await db.query(
        'UPDATE rv_notification_preference SET enabled = ?, updated_at = NOW() WHERE id = ?',
        [pref.enabled ? 1 : 0, existing[0].id]
      );
    } else {
      await db.query(
        'INSERT INTO rv_notification_preference (user_id, tenant_id, event_type, channel, enabled) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, req.tenant.id, pref.event_type, channel, pref.enabled ? 1 : 0]
      );
    }
  }

  res.json({ success: true, message: 'Preferences updated.' });
}));

// PUT /api/v1/notifications/:id/read — Mark one as read
router.put('/:id/read', [
  param('id').isInt({ min: 1 }).withMessage('Invalid notification ID'),
  validate
], asyncHandler(async (req, res) => {
  const updated = await markAsRead(req.params.id, req.user.id);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Notification not found or already read' });
  }
  res.json({ success: true });
}));

module.exports = router;
