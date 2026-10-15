const db = require('../config/db');
const logger = require('./logger');

/**
 * Push notification service for mobile devices via Firebase Cloud Messaging.
 *
 * Setup: Set FIREBASE_SERVER_KEY in .env (or use Firebase Admin SDK credentials).
 * Device tokens are stored in rv_device_token table.
 */

const FCM_URL = 'https://fcm.googleapis.com/fcm/send';

/**
 * Register a device token for push notifications.
 */
async function registerDeviceToken(userId, tenantId, { token, platform, device_name }) {
  // Upsert: update if token exists, insert if new
  await db.query(
    `INSERT INTO rv_device_token (user_id, tenant_id, token, platform, device_name, last_used_at)
     VALUES (?, ?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE last_used_at = NOW(), platform = VALUES(platform), device_name = VALUES(device_name)`,
    [userId, tenantId, token, platform || 'android', device_name || null]
  );
}

/**
 * Remove a device token (e.g., on logout).
 */
async function removeDeviceToken(userId, token) {
  await db.query(
    'DELETE FROM rv_device_token WHERE user_id = ? AND token = ?',
    [userId, token]
  );
}

/**
 * Send a push notification to all devices of a user.
 */
async function sendPushToUser(userId, { title, body, data = {} }) {
  const serverKey = process.env.FIREBASE_SERVER_KEY;
  if (!serverKey) {
    logger.warn('FIREBASE_SERVER_KEY not configured — push notification skipped');
    return 0;
  }

  const [tokens] = await db.query(
    'SELECT token FROM rv_device_token WHERE user_id = ?',
    [userId]
  );

  if (tokens.length === 0) return 0;

  let sent = 0;
  for (const { token } of tokens) {
    try {
      const res = await fetch(FCM_URL, {
        method: 'POST',
        headers: {
          'Authorization': `key=${serverKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: token,
          notification: { title, body, sound: 'default', badge: '1' },
          data,
          priority: 'high'
        })
      });

      const result = await res.json();
      if (result.success === 1) {
        sent++;
      } else if (result.results?.[0]?.error === 'NotRegistered') {
        // Token is stale — remove it
        await db.query('DELETE FROM rv_device_token WHERE token = ?', [token]);
      }
    } catch (e) {
      logger.error(`Push notification failed for token ${token.slice(0, 10)}...: ${e.message}`);
    }
  }

  return sent;
}

/**
 * Send push to all users in a tenant (e.g., broadcast).
 */
async function sendPushToTenant(tenantId, { title, body, data = {} }) {
  const [tokens] = await db.query(
    'SELECT DISTINCT token FROM rv_device_token WHERE tenant_id = ?',
    [tenantId]
  );

  if (tokens.length === 0) return 0;

  const serverKey = process.env.FIREBASE_SERVER_KEY;
  if (!serverKey) return 0;

  // FCM supports up to 1000 tokens in multicast
  const tokenList = tokens.map(t => t.token);

  try {
    const res = await fetch(FCM_URL, {
      method: 'POST',
      headers: {
        'Authorization': `key=${serverKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        registration_ids: tokenList.slice(0, 1000),
        notification: { title, body, sound: 'default' },
        data,
        priority: 'high'
      })
    });

    const result = await res.json();
    return result.success || 0;
  } catch (e) {
    logger.error(`Tenant push broadcast failed: ${e.message}`);
    return 0;
  }
}

module.exports = {
  registerDeviceToken,
  removeDeviceToken,
  sendPushToUser,
  sendPushToTenant
};
