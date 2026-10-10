const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const db = require('../../config/db');
const validate = require('../../middleware/validate');
const { requireRvRole } = require('../../middleware/tenantAuth');
const asyncHandler = require('../../utils/asyncHandler');
const { createInvitation, cancelInvitation } = require('../../services/invitationService');
const { sendInvitationEmail } = require('../../services/emailService');

const VALID_ROLES = ['user', 'admin', 'vet', 'assistant', 'receptionist', 'pharmacist'];

/**
 * GET /v1/team - List team members for current tenant
 */
router.get('/', asyncHandler(async (req, res) => {
  const [members] = await db.query(
    `SELECT u.id, u.email, u.first_name, u.last_name, u.avatar_url, u.last_login_at,
            ut.role, ut.is_active, ut.created_at as joined_at
     FROM rv_user_tenant ut
     JOIN rv_users u ON ut.user_id = u.id
     WHERE ut.tenant_id = ? AND ut.is_active = 1
     ORDER BY ut.created_at ASC`,
    [req.tenant.id]
  );

  res.json({ success: true, data: members });
}));

/**
 * GET /v1/team/invitations - List pending invitations
 */
router.get('/invitations', requireRvRole('owner', 'admin'), asyncHandler(async (req, res) => {
  const [invitations] = await db.query(
    `SELECT i.id, i.email, i.role, i.status, i.expires_at, i.created_at,
            u.first_name as invited_by_first_name, u.last_name as invited_by_last_name
     FROM rv_user_invitation i
     JOIN rv_users u ON i.invited_by = u.id
     WHERE i.tenant_id = ? AND i.status = 'pending' AND i.expires_at > NOW()
     ORDER BY i.created_at DESC`,
    [req.tenant.id]
  );

  res.json({ success: true, data: invitations });
}));

/**
 * POST /v1/team/invite - Create invitation and send email
 */
router.post('/invite',
  requireRvRole('owner', 'admin'),
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('role').isIn(VALID_ROLES).withMessage('Invalid role.')
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { email, role } = req.body;

    // Check if email already exists in this tenant
    const [existing] = await db.query(
      `SELECT u.id FROM rv_users u
       JOIN rv_user_tenant ut ON u.id = ut.user_id
       WHERE u.email = ? AND ut.tenant_id = ? AND ut.is_active = 1`,
      [email, req.tenant.id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'This user is already a member of your team.' });
    }

    // Check if there's already a pending invitation for this email
    const [pendingInvite] = await db.query(
      `SELECT id FROM rv_user_invitation
       WHERE email = ? AND tenant_id = ? AND status = 'pending' AND expires_at > NOW()`,
      [email, req.tenant.id]
    );

    if (pendingInvite.length > 0) {
      return res.status(409).json({ success: false, message: 'An invitation has already been sent to this email.' });
    }

    const invitation = await createInvitation(req.tenant.id, email, role, req.user.id);

    // Get inviter name
    const [inviter] = await db.query('SELECT first_name, last_name FROM rv_users WHERE id = ?', [req.user.id]);
    const inviterName = inviter.length > 0 ? `${inviter[0].first_name} ${inviter[0].last_name}` : 'A team member';

    // Send invitation email (async, don't block)
    sendInvitationEmail({
      email,
      inviterName,
      tenantName: req.tenant.name,
      token: invitation.token
    }).catch(() => {});

    res.status(201).json({ success: true, data: invitation, message: 'Invitation sent successfully.' });
  })
);

/**
 * PUT /v1/team/:userId/role - Change user role within tenant
 */
router.put('/:userId/role',
  requireRvRole('owner', 'admin'),
  [
    param('userId').isInt().withMessage('Valid user ID is required.'),
    body('role').isIn(VALID_ROLES).withMessage('Invalid role.')
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    // Cannot change own role
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role.' });
    }

    // Check target user's current role
    const [targetUser] = await db.query(
      'SELECT role FROM rv_user_tenant WHERE user_id = ? AND tenant_id = ? AND is_active = 1',
      [userId, req.tenant.id]
    );

    if (targetUser.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found in this team.' });
    }

    // Cannot change owner role
    if (targetUser[0].role === 'owner') {
      return res.status(403).json({ success: false, message: 'Cannot change the owner role.' });
    }

    await db.query(
      'UPDATE rv_user_tenant SET role = ? WHERE user_id = ? AND tenant_id = ?',
      [role, userId, req.tenant.id]
    );

    res.json({ success: true, message: 'Role updated successfully.' });
  })
);

/**
 * DELETE /v1/team/:userId - Remove user from tenant
 */
router.delete('/:userId',
  requireRvRole('owner', 'admin'),
  [param('userId').isInt().withMessage('Valid user ID is required.')],
  validate,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Cannot remove self
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot remove yourself from the team.' });
    }

    // Check target user's current role
    const [targetUser] = await db.query(
      'SELECT role FROM rv_user_tenant WHERE user_id = ? AND tenant_id = ? AND is_active = 1',
      [userId, req.tenant.id]
    );

    if (targetUser.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found in this team.' });
    }

    // Cannot remove owner
    if (targetUser[0].role === 'owner') {
      return res.status(403).json({ success: false, message: 'Cannot remove the owner from the team.' });
    }

    await db.query(
      'UPDATE rv_user_tenant SET is_active = 0 WHERE user_id = ? AND tenant_id = ?',
      [userId, req.tenant.id]
    );

    res.json({ success: true, message: 'User removed from team.' });
  })
);

/**
 * DELETE /v1/team/invitations/:id - Cancel invitation
 */
router.delete('/invitations/:id',
  requireRvRole('owner', 'admin'),
  [param('id').isInt().withMessage('Valid invitation ID is required.')],
  validate,
  asyncHandler(async (req, res) => {
    const cancelled = await cancelInvitation(req.params.id, req.tenant.id);

    if (!cancelled) {
      return res.status(404).json({ success: false, message: 'Invitation not found or already processed.' });
    }

    res.json({ success: true, message: 'Invitation cancelled.' });
  })
);

module.exports = router;
