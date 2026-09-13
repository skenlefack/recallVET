const db = require('../config/db');

async function logAudit(tenantId, userId, entityType, entityId, action, oldValues, newValues, ip) {
  try {
    await db.query(
      `INSERT INTO rv_audit_log (tenant_id, user_id, entity_type, entity_id, action, old_values, new_values, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tenantId,
        userId || null,
        entityType,
        entityId || null,
        action,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        ip || null
      ]
    );
  } catch (error) {
    console.error('Audit log error:', error.message);
  }
}

module.exports = { logAudit };
