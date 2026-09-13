const crypto = require('crypto');
const db = require('../config/db');

async function createInvitation(tenantId, email, role, invitedBy) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const [result] = await db.query(
    `INSERT INTO rv_user_invitation (tenant_id, email, role, invited_by, token, status, expires_at)
     VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
    [tenantId, email, role, invitedBy, token, expiresAt]
  );

  return {
    id: result.insertId,
    tenant_id: tenantId,
    email,
    role,
    invited_by: invitedBy,
    token,
    status: 'pending',
    expires_at: expiresAt
  };
}

async function getInvitationByToken(token) {
  const [rows] = await db.query(
    `SELECT i.*, t.name as tenant_name
     FROM rv_user_invitation i
     JOIN rv_tenant t ON i.tenant_id = t.id
     WHERE i.token = ? AND i.status = 'pending' AND i.expires_at > NOW()`,
    [token]
  );
  return rows.length > 0 ? rows[0] : null;
}

async function acceptInvitation(token, userId) {
  const invitation = await getInvitationByToken(token);
  if (!invitation) {
    throw new Error('Invalid or expired invitation.');
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Check if user is already linked to this tenant
    const [existing] = await conn.query(
      'SELECT id, is_active FROM rv_user_tenant WHERE user_id = ? AND tenant_id = ?',
      [userId, invitation.tenant_id]
    );

    if (existing.length > 0) {
      if (existing[0].is_active) {
        throw new Error('User is already a member of this team.');
      }
      // Reactivate existing link
      await conn.query(
        'UPDATE rv_user_tenant SET is_active = 1, role = ? WHERE id = ?',
        [invitation.role, existing[0].id]
      );
    } else {
      // Get default structure and site for the tenant
      const [structures] = await conn.query(
        'SELECT id FROM rv_structure WHERE tenant_id = ? LIMIT 1',
        [invitation.tenant_id]
      );
      const structureId = structures.length > 0 ? structures[0].id : null;

      let siteId = null;
      if (structureId) {
        const [sites] = await conn.query(
          'SELECT id FROM rv_site WHERE structure_id = ? LIMIT 1',
          [structureId]
        );
        siteId = sites.length > 0 ? sites[0].id : null;
      }

      await conn.query(
        `INSERT INTO rv_user_tenant (user_id, tenant_id, structure_id, site_id, role)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, invitation.tenant_id, structureId, siteId, invitation.role]
      );
    }

    // Mark invitation as accepted
    await conn.query(
      'UPDATE rv_user_invitation SET status = ?, accepted_at = NOW() WHERE id = ?',
      ['accepted', invitation.id]
    );

    await conn.commit();
    return invitation;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function cancelInvitation(invitationId, tenantId) {
  const [result] = await db.query(
    `UPDATE rv_user_invitation SET status = 'cancelled' WHERE id = ? AND tenant_id = ? AND status = 'pending'`,
    [invitationId, tenantId]
  );
  return result.affectedRows > 0;
}

module.exports = {
  createInvitation,
  getInvitationByToken,
  acceptInvitation,
  cancelInvitation
};
