const express = require('express');
const router = express.Router();
const { query, param } = require('express-validator');
const validate = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
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
