const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../../config/db');
const { auth } = require('../../middleware/auth');
const { getTenantSubscription } = require('../../services/subscriptionService');
const { generateSaasInvoicePDF } = require('../../services/pdfService');
const validate = require('../../middleware/validate');
const { updateProfile, changePassword } = require('../../validators/account');
const asyncHandler = require('../../utils/asyncHandler');

// Multer config for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/avatars');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user_${req.user.id}_${Date.now()}${ext}`);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed.'));
    }
  }
});

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

// POST /account/avatar — Upload user avatar
router.post('/avatar', avatarUpload.single('avatar'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;

  // Get old avatar to clean up
  const [rows] = await db.query('SELECT avatar_url FROM rv_users WHERE id = ?', [req.user.id]);
  if (rows.length > 0 && rows[0].avatar_url) {
    const oldPath = path.join(__dirname, '../../', rows[0].avatar_url);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  await db.query(
    'UPDATE rv_users SET avatar_url = ? WHERE id = ?',
    [avatarUrl, req.user.id]
  );

  res.json({ success: true, message: 'Avatar uploaded.', data: { avatar_url: avatarUrl } });
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

// GET /account/invoices/:id/pdf - Generate SaaS invoice PDF
router.get('/invoices/:id/pdf', asyncHandler(async (req, res) => {
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) return res.status(400).json({ success: false, message: 'X-Tenant-Id header required.' });

  const [ut] = await db.query(
    'SELECT id FROM rv_user_tenant WHERE user_id = ? AND tenant_id = ? AND is_active = 1',
    [req.user.id, tenantId]
  );
  if (ut.length === 0) return res.status(403).json({ success: false, message: 'Access denied.' });

  const [rows] = await db.query(
    `SELECT si.*, p.name_en as plan_name
     FROM rv_saas_invoice si
     LEFT JOIN rv_subscription sub ON si.subscription_id = sub.id
     LEFT JOIN rv_plan p ON sub.plan_id = p.id
     WHERE si.id = ? AND si.tenant_id = ?`,
    [req.params.id, tenantId]
  );
  if (rows.length === 0) return res.status(404).json({ success: false, message: 'Invoice not found.' });

  const [tenants] = await db.query('SELECT * FROM rv_tenant WHERE id = ?', [tenantId]);
  const tenantData = tenants[0] || { name: 'Clinic' };

  const invoiceData = rows[0];
  const buffer = await generateSaasInvoicePDF(invoiceData, tenantData);

  // Store PDF path reference
  const pdfPath = `/api/account/invoices/${req.params.id}/pdf`;
  await db.query('UPDATE rv_saas_invoice SET pdf_url = ? WHERE id = ?', [pdfPath, req.params.id]);

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="saas-invoice-${invoiceData.invoice_number || req.params.id}.pdf"`,
    'Content-Length': buffer.length
  });
  res.send(buffer);
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

// Multer error handler
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Maximum size is 2MB.' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.message === 'Only JPEG and PNG images are allowed.') {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

module.exports = router;
