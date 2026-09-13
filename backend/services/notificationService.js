const db = require('../config/db');

/**
 * Create a new in-app notification.
 */
async function createNotification(tenantId, userId, { type = 'info', title, body = null, data = null }) {
  const [result] = await db.query(
    `INSERT INTO rv_notification (tenant_id, user_id, type, title, body, data)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [tenantId, userId, type, title, body, data ? JSON.stringify(data) : null]
  );
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
