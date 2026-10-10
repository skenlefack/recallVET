const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../config/db');
const { auth, generateAccessToken, generateRefreshToken, JWT_REFRESH_SECRET } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { createTrialSubscription } = require('../services/subscriptionService');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/emailService');
const { getInvitationByToken, acceptInvitation } = require('../services/invitationService');
const validate = require('../middleware/validate');
const { register, login, refresh, forgotPassword, resetPassword } = require('../validators/auth');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../services/logger');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user and create a tenant
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, first_name, last_name]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               practice_name:
 *                 type: string
 *               practice_type:
 *                 type: string
 *                 enum: [clinic, mixed, farm, equine]
 *               country_code:
 *                 type: string
 *               preferred_language:
 *                 type: string
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', register, validate, asyncHandler(async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { email, password, first_name, last_name, phone, practice_name, practice_type, country_code, preferred_language } = req.body;

    // Check duplicate email
    const [existing] = await conn.query('SELECT id FROM rv_users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    await conn.beginTransaction();

    // 1. Create user
    const passwordHash = await bcrypt.hash(password, 10);
    const [userResult] = await conn.query(
      `INSERT INTO rv_users (email, password_hash, first_name, last_name, phone, role, status, preferred_language)
       VALUES (?, ?, ?, ?, ?, 'user', 'active', ?)`,
      [email, passwordHash, first_name, last_name, phone || null, preferred_language || 'fr']
    );
    const userId = userResult.insertId;

    // 2. Create tenant
    const tenantName = practice_name || `${first_name} ${last_name}`;
    const slug = tenantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
    const [tenantResult] = await conn.query(
      `INSERT INTO rv_tenant (name, slug, default_currency, default_language, country_code)
       VALUES (?, ?, 'XAF', ?, ?)`,
      [tenantName, slug, preferred_language || 'fr', country_code || 'CM']
    );
    const tenantId = tenantResult.insertId;

    // 3. Create structure
    const structureType = practice_type || 'mixed';
    const [structureResult] = await conn.query(
      `INSERT INTO rv_structure (tenant_id, name, type) VALUES (?, ?, ?)`,
      [tenantId, tenantName, structureType]
    );
    const structureId = structureResult.insertId;

    // 4. Create default site
    const [siteResult] = await conn.query(
      `INSERT INTO rv_site (structure_id, name) VALUES (?, ?)`,
      [structureId, 'Site principal']
    );
    const siteId = siteResult.insertId;

    // 5. Link user to tenant as owner
    await conn.query(
      `INSERT INTO rv_user_tenant (user_id, tenant_id, structure_id, site_id, role)
       VALUES (?, ?, ?, ?, 'owner')`,
      [userId, tenantId, structureId, siteId]
    );

    // 6. Create trial subscription (professional plan)
    const [plans] = await conn.query('SELECT id, trial_days FROM rv_plan WHERE code = ?', ['professional']);
    if (plans.length > 0) {
      const plan = plans[0];
      const now = new Date();
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + (plan.trial_days || 14));
      await conn.query(
        `INSERT INTO rv_subscription (tenant_id, plan_id, status, billing_cycle, trial_starts_at, trial_ends_at)
         VALUES (?, ?, 'trialing', 'monthly', ?, ?)`,
        [tenantId, plan.id, now.toISOString().split('T')[0], trialEnd.toISOString().split('T')[0]]
      );
    }

    // 7. Create default stock location
    await conn.query(
      `INSERT INTO rv_stock_location (tenant_id, site_id, name, location_type) VALUES (?, ?, 'Stock principal', 'main_store')`,
      [tenantId, siteId]
    );

    await conn.commit();

    // Generate tokens
    const user = { id: userId, email, role: 'user' };
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    const refreshExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await db.query(
      'INSERT INTO rv_refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, refreshToken, refreshExpiry]
    );

    // Send welcome email (async, don't block)
    sendWelcomeEmail({ email, first_name }).catch(() => {});

    logger.info('New user registered', { userId, tenantId, email });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        token: accessToken,
        refreshToken,
        user: { id: userId, email, first_name, last_name, role: 'user', preferred_language: preferred_language || 'fr' },
        tenant: { id: tenantId, name: tenantName, slug }
      }
    });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user and receive tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       423:
 *         description: Account locked
 */
router.post('/login', login, validate, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const [users] = await db.query('SELECT * FROM rv_users WHERE email = ?', [email]);
  if (users.length === 0) {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }

  const user = users[0];

  // Check account lockout
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    return res.status(423).json({ success: false, message: 'Account temporarily locked. Try again later.' });
  }

  if (user.status !== 'active') {
    return res.status(401).json({ success: false, message: 'Account is not active.' });
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    // Increment failed attempts
    const attempts = (user.failed_login_attempts || 0) + 1;
    const lockUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
    await db.query('UPDATE rv_users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?',
      [attempts, lockUntil, user.id]);
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }

  // Reset failed attempts on success
  await db.query('UPDATE rv_users SET last_login_at = NOW(), last_login_ip = ?, failed_login_attempts = 0, locked_until = NULL WHERE id = ?', [req.ip, user.id]);

  // Get tenant info
  const [tenants] = await db.query(
    `SELECT ut.tenant_id, ut.role as rv_role, t.name as tenant_name, t.slug as tenant_slug
     FROM rv_user_tenant ut
     JOIN rv_tenant t ON ut.tenant_id = t.id AND t.is_active = 1
     WHERE ut.user_id = ? AND ut.is_active = 1`,
    [user.id]
  );

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store refresh token
  const refreshExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.query(
    'INSERT INTO rv_refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
    [user.id, refreshToken, refreshExpiry]
  );

  res.json({
    success: true,
    data: {
      token: accessToken,
      refreshToken,
      expiresIn: 86400,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        preferred_language: user.preferred_language,
        avatar_url: user.avatar_url
      },
      tenants: tenants.map(t => ({ id: t.tenant_id, name: t.tenant_name, slug: t.tenant_slug, role: t.rv_role }))
    }
  });
}));

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New tokens issued
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', refresh, validate, asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

  const [tokens] = await db.query(
    'SELECT * FROM rv_refresh_tokens WHERE token = ? AND user_id = ? AND revoked = 0 AND expires_at > NOW()',
    [refreshToken, decoded.id]
  );

  if (tokens.length === 0) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }

  // Revoke old token
  await db.query('UPDATE rv_refresh_tokens SET revoked = 1 WHERE id = ?', [tokens[0].id]);

  const [users] = await db.query('SELECT id, email, role, status FROM rv_users WHERE id = ?', [decoded.id]);
  if (users.length === 0 || users[0].status !== 'active') {
    return res.status(401).json({ success: false, message: 'User not found or inactive.' });
  }

  const user = users[0];
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  const refreshExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.query(
    'INSERT INTO rv_refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
    [user.id, newRefreshToken, refreshExpiry]
  );

  res.json({
    success: true,
    data: { token: newAccessToken, refreshToken: newRefreshToken }
  });
}));

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset email sent (if account exists)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post('/forgot-password', forgotPassword, validate, asyncHandler(async (req, res) => {
  const { email } = req.body;

  const [users] = await db.query('SELECT id, email, first_name FROM rv_users WHERE email = ?', [email]);

  // Always respond success to prevent email enumeration
  if (users.length === 0) {
    return res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
  }

  const user = users[0];
  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.query(
    'INSERT INTO rv_password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
    [user.id, resetToken, expiresAt]
  );

  await sendPasswordResetEmail(user, resetToken);

  res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
}));

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using a reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired reset token
 */
router.post('/reset-password', resetPassword, validate, asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const [resets] = await db.query(
    'SELECT * FROM rv_password_resets WHERE token = ? AND used = 0 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
    [token]
  );

  if (resets.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.query('UPDATE rv_users SET password_hash = ? WHERE id = ?', [passwordHash, resets[0].user_id]);
  await db.query('UPDATE rv_password_resets SET used = 1 WHERE id = ?', [resets[0].id]);

  // Revoke all refresh tokens for security
  await db.query('UPDATE rv_refresh_tokens SET revoked = 1 WHERE user_id = ?', [resets[0].user_id]);

  res.json({ success: true, message: 'Password reset successfully.' });
}));

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user info
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user and tenants
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Not authenticated
 */
router.get('/me', auth, asyncHandler(async (req, res) => {
  const [tenants] = await db.query(
    `SELECT ut.tenant_id, ut.role as rv_role, t.name as tenant_name, t.slug as tenant_slug
     FROM rv_user_tenant ut
     JOIN rv_tenant t ON ut.tenant_id = t.id AND t.is_active = 1
     WHERE ut.user_id = ? AND ut.is_active = 1`,
    [req.user.id]
  );

  res.json({
    success: true,
    data: {
      user: req.user,
      tenants: tenants.map(t => ({ id: t.tenant_id, name: t.tenant_name, slug: t.tenant_slug, role: t.rv_role }))
    }
  });
}));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout and revoke all refresh tokens
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', auth, asyncHandler(async (req, res) => {
  await db.query('UPDATE rv_refresh_tokens SET revoked = 1 WHERE user_id = ?', [req.user.id]);
  res.json({ success: true, message: 'Logged out successfully.' });
}));

/**
 * POST /auth/accept-invite - Accept a team invitation
 */
router.post('/accept-invite', [
  require('express-validator').body('token').notEmpty().withMessage('Invitation token is required.'),
  require('express-validator').body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  require('express-validator').body('first_name').trim().notEmpty().withMessage('First name is required.'),
  require('express-validator').body('last_name').trim().notEmpty().withMessage('Last name is required.'),
  require('express-validator').body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
], validate, asyncHandler(async (req, res) => {
  const { token, email, password, first_name, last_name } = req.body;

  // Validate invitation
  const invitation = await getInvitationByToken(token);
  if (!invitation) {
    return res.status(400).json({ success: false, message: 'Invalid or expired invitation.' });
  }

  if (invitation.email !== email) {
    return res.status(400).json({ success: false, message: 'Email does not match the invitation.' });
  }

  // Check if user already exists
  const [existingUsers] = await db.query('SELECT id FROM rv_users WHERE email = ?', [email]);
  let userId;

  if (existingUsers.length > 0) {
    userId = existingUsers[0].id;
  } else {
    // Create new user
    const passwordHash = await bcrypt.hash(password, 10);
    const [userResult] = await db.query(
      `INSERT INTO rv_users (email, password_hash, first_name, last_name, role, status)
       VALUES (?, ?, ?, ?, 'user', 'active')`,
      [email, passwordHash, first_name, last_name]
    );
    userId = userResult.insertId;
  }

  // Accept invitation (links user to tenant)
  await acceptInvitation(token, userId);

  logger.info('Invitation accepted', { userId, tenantId: invitation.tenant_id, email });

  res.json({ success: true, message: 'Invitation accepted successfully. You can now log in.' });
}));

module.exports = router;
