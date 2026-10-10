const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../../config/db');
const { auth } = require('../../middleware/auth');
const { getTenantSubscription } = require('../../services/subscriptionService');
const validate = require('../../middleware/validate');
const { updateProfile, changePassword } = require('../../validators/account');
const asyncHandler = require('../../utils/asyncHandler');

router.use(auth);

// GET /account/profile
router.get('/profile', asyncHandler(async (req, res) => {
  const [users] = await db.query(
    'SELECT id, email, first_name, last_name, phone, role, preferred_language, avatar_url, created_at FROM rv_users WHERE id = ?',
    [req.user.id]
  );
  res.json({ success: true, data: users[0] });
}));

// PUT /account/profile
router.put('/profile', updateProfile, validate, asyncHandler(async (req, res) => {
  const { first_name, last_name, phone, preferred_language } = req.body;
  await db.query(
    'UPDATE rv_users SET first_name = ?, last_name = ?, phone = ?, preferred_language = ? WHERE id = ?',
    [first_name, last_name, phone || null, preferred_language || 'fr', req.user.id]
  );
  res.json({ success: true, message: 'Profile updated.' });
}));

// PUT /account/password
router.put('/password', changePassword, validate, asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;

  const [users] = await db.query('SELECT password_hash FROM rv_users WHERE id = ?', [req.user.id]);
  const isMatch = await bcrypt.compare(current_password, users[0].password_hash);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
  }

  const hash = await bcrypt.hash(new_password, 10);
  await db.query('UPDATE rv_users SET password_hash = ? WHERE id = ?', [hash, req.user.id]);
  res.json({ success: true, message: 'Password updated.' });
}));

// GET /account/subscription
router.get('/subscription', asyncHandler(async (req, res) => {
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) {
    return res.status(400).json({ success: false, message: 'X-Tenant-Id header required.' });
  }

  // Verify user belongs to tenant
  const [ut] = await db.query(
    'SELECT id FROM rv_user_tenant WHERE user_id = ? AND tenant_id = ? AND is_active = 1',
    [req.user.id, tenantId]
  );
  if (ut.length === 0) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  const sub = await getTenantSubscription(tenantId);
  res.json({ success: true, data: sub });
}));

// GET /account/invoices
router.get('/invoices', asyncHandler(async (req, res) => {
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) return res.status(400).json({ success: false, message: 'X-Tenant-Id header required.' });

  const [ut] = await db.query(
    'SELECT id FROM rv_user_tenant WHERE user_id = ? AND tenant_id = ? AND is_active = 1',
    [req.user.id, tenantId]
  );
  if (ut.length === 0) return res.status(403).json({ success: false, message: 'Access denied.' });

  const [invoices] = await db.query(
    `SELECT si.*, sp.amount as paid_amount, sp.payment_method, sp.payment_date
     FROM rv_saas_invoice si
     LEFT JOIN rv_saas_payment sp ON si.id = sp.invoice_id
     WHERE si.tenant_id = ? ORDER BY si.created_at DESC`,
    [tenantId]
  );
  res.json({ success: true, data: invoices });
}));

// POST /account/checkout - Create Stripe checkout session
router.post('/checkout', asyncHandler(async (req, res) => {
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) return res.status(400).json({ success: false, message: 'X-Tenant-Id header required.' });

  const [ut] = await db.query(
    'SELECT id FROM rv_user_tenant WHERE user_id = ? AND tenant_id = ? AND is_active = 1',
    [req.user.id, tenantId]
  );
  if (ut.length === 0) return res.status(403).json({ success: false, message: 'Access denied.' });

  const { plan_code, billing_cycle } = req.body;
  if (!plan_code || !billing_cycle) {
    return res.status(400).json({ success: false, message: 'plan_code and billing_cycle are required.' });
  }

  // Look up plan
  const [plans] = await db.query(
    'SELECT id, stripe_price_monthly, stripe_price_yearly FROM rv_plan WHERE code = ? AND is_active = 1',
    [plan_code]
  );
  if (plans.length === 0) {
    return res.status(404).json({ success: false, message: 'Plan not found.' });
  }

  const plan = plans[0];
  const priceId = billing_cycle === 'yearly' ? plan.stripe_price_yearly : plan.stripe_price_monthly;
  if (!priceId) {
    return res.status(400).json({ success: false, message: 'Stripe price not configured for this plan/cycle.' });
  }

  const { createCheckoutSession } = require('../../services/stripeService');
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3010';
  const session = await createCheckoutSession(
    tenantId,
    priceId,
    `${frontendUrl}/account/billing?success=true`,
    `${frontendUrl}/account/billing?cancelled=true`
  );

  res.json({ success: true, data: { url: session.url, session_id: session.id } });
}));

// POST /account/billing-portal - Create Stripe billing portal session
router.post('/billing-portal', asyncHandler(async (req, res) => {
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) return res.status(400).json({ success: false, message: 'X-Tenant-Id header required.' });

  const [ut] = await db.query(
    'SELECT id FROM rv_user_tenant WHERE user_id = ? AND tenant_id = ? AND is_active = 1',
    [req.user.id, tenantId]
  );
  if (ut.length === 0) return res.status(403).json({ success: false, message: 'Access denied.' });

  const [tenants] = await db.query(
    'SELECT stripe_customer_id FROM rv_tenant WHERE id = ?',
    [tenantId]
  );
  if (tenants.length === 0 || !tenants[0].stripe_customer_id) {
    return res.status(400).json({ success: false, message: 'No Stripe customer found for this tenant.' });
  }

  const { createBillingPortalSession } = require('../../services/stripeService');
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3010';
  const session = await createBillingPortalSession(
    tenants[0].stripe_customer_id,
    `${frontendUrl}/account/billing`
  );

  res.json({ success: true, data: { url: session.url } });
}));

// POST /account/cancel-subscription - Cancel subscription at period end
router.post('/cancel-subscription', asyncHandler(async (req, res) => {
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) return res.status(400).json({ success: false, message: 'X-Tenant-Id header required.' });

  const [ut] = await db.query(
    'SELECT id FROM rv_user_tenant WHERE user_id = ? AND tenant_id = ? AND is_active = 1',
    [req.user.id, tenantId]
  );
  if (ut.length === 0) return res.status(403).json({ success: false, message: 'Access denied.' });

  const [subs] = await db.query(
    `SELECT stripe_subscription_id FROM rv_subscription WHERE tenant_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
    [tenantId]
  );
  if (subs.length === 0 || !subs[0].stripe_subscription_id) {
    return res.status(400).json({ success: false, message: 'No active Stripe subscription found.' });
  }

  const Stripe = require('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  await stripe.subscriptions.update(subs[0].stripe_subscription_id, {
    cancel_at_period_end: true
  });

  await db.query(
    'UPDATE rv_subscription SET cancel_at_period_end = 1 WHERE stripe_subscription_id = ?',
    [subs[0].stripe_subscription_id]
  );

  res.json({ success: true, message: 'Subscription will be cancelled at end of billing period.' });
}));

module.exports = router;
