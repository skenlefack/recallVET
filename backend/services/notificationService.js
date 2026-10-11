const db = require('../config/db');
const { getIO } = require('../config/socket');

/**
 * Create a new in-app notification.
 * Checks user preferences before inserting — if user has disabled this event_type, skip.
 * Emits the notification via Socket.IO for real-time delivery.
 */
async function createNotification(tenantId, userId, { type = 'info', title, body = null, data = null, event_type = null }) {
  // Check user preference if event_type is provided
  if (event_type) {
    const [prefs] = await db.query(
      'SELECT enabled FROM rv_notification_preference WHERE user_id = ? AND tenant_id = ? AND event_type = ? AND channel = ?',
      [userId, tenantId, event_type, 'in_app']
    );
    // If a preference exists and is disabled, skip notification
    if (prefs.length > 0 && !prefs[0].enabled) {
      return null;
    }
  }

  const [result] = await db.query(
    `INSERT INTO rv_notification (tenant_id, user_id, type, title, body, data)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [tenantId, userId, type, title, body, data ? JSON.stringify(data) : null]
  );

  // Emit real-time notification via Socket.IO
  const io = getIO();
  if (io) {
    io.to(`user_${userId}`).emit('notification', {
      id: result.insertId,
      type,
      title,
      body,
      data,
      is_read: 0,
      created_at: new Date().toISOString()
    });
  }

  return result.insertId;
}

/**
 * Get paginated notifications for a user within a tenant.
 */
async function getNotifications(userId, tenantId, { page = 1, limit = 20 }) {
  const safeLimit = Math.min(parseInt(limit) || 20, 100);
  const offset = (parseInt(page) - 1) * safeLimit;

  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) as total FROM rv_notification WHERE user_id = ? AND tenant_id = ?`,
    [userId, tenantId]
  );

  const [rows] = await db.query(
    `SELECT id, type, title, body, data, is_read, read_at, created_at
     FROM rv_notification
     WHERE user_id = ? AND tenant_id = ?
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, tenantId, safeLimit, offset]
  );

  return {
    notifications: rows,
    pagination: {
      total,
      page: parseInt(page),
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit)
    }
  };
}

/**
 * Get the count of unread notifications for a user within a tenant.
 */
async function getUnreadCount(userId, tenantId) {
  const [[{ count }]] = await db.query(
    `SELECT COUNT(*) as count FROM rv_notification WHERE user_id = ? AND tenant_id = ? AND is_read = 0`,
    [userId, tenantId]
  );
  return count;
}

/**
 * Mark a single notification as read (only if it belongs to the user).
 */
async function markAsRead(notificationId, userId) {
  const [result] = await db.query(
    `UPDATE rv_notification SET is_read = 1, read_at = NOW() WHERE id = ? AND user_id = ? AND is_read = 0`,
    [notificationId, userId]
  );
  return result.affectedRows > 0;
}

/**
 * Mark all notifications as read for a user within a tenant.
 */
async function markAllAsRead(userId, tenantId) {
  const [result] = await db.query(
    `UPDATE rv_notification SET is_read = 1, read_at = NOW() WHERE user_id = ? AND tenant_id = ? AND is_read = 0`,
    [userId, tenantId]
  );
  return result.affectedRows;
}

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};
