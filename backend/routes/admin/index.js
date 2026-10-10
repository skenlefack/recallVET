const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { auth, authorize } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { updateDemoRequest } = require('../../validators/admin');
const asyncHandler = require('../../utils/asyncHandler');

router.use(auth);
router.use(authorize('superadmin'));

// GET /admin/dashboard - Platform stats
router.get('/dashboard', asyncHandler(async (req, res) => {
  const [[{ totalTenants }]] = await db.query('SELECT COUNT(*) as totalTenants FROM rv_tenant WHERE is_active = 1');
  const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) as totalUsers FROM rv_users WHERE status = "active"');
  const [[{ activeSubscriptions }]] = await db.query('SELECT COUNT(*) as activeSubscriptions FROM rv_subscription WHERE status IN ("trialing", "active")');
  const [[{ trialSubscriptions }]] = await db.query('SELECT COUNT(*) as trialSubscriptions FROM rv_subscription WHERE status = "trialing"');
  const [[{ totalAnimals }]] = await db.query('SELECT COUNT(*) as totalAnimals FROM rv_animal');
  const [[{ totalParties }]] = await db.query('SELECT COUNT(*) as totalParties FROM rv_party');

  const [recentSignups] = await db.query(
    'SELECT id, email, first_name, last_name, created_at FROM rv_users ORDER BY created_at DESC LIMIT 10'
  );

  const [recentDemos] = await db.query(
    'SELECT id, full_name, email, practice_name, status, created_at FROM rv_demo_request ORDER BY created_at DESC LIMIT 10'
  );

  res.json({
    success: true,
    data: {
      stats: { totalTenants, totalUsers, activeSubscriptions, trialSubscriptions, totalAnimals, totalParties },
      recentSignups,
      recentDemos
    }
  });
}));

// GET /admin/tenants
router.get('/tenants', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = (page - 1) * limit;

  const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM rv_tenant');
  const [tenants] = await db.query(
    `SELECT t.*, s.status as sub_status, p.name_fr as plan_name, s.trial_ends_at,
            (SELECT COUNT(*) FROM rv_user_tenant WHERE tenant_id = t.id) as user_count
     FROM rv_tenant t
     LEFT JOIN rv_subscription s ON s.tenant_id = t.id
     LEFT JOIN rv_plan p ON s.plan_id = p.id
     ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  res.json({ success: true, data: tenants, total, page, limit });
}));

// GET /admin/tenants/:id
router.get('/tenants/:id', asyncHandler(async (req, res) => {
  const [tenants] = await db.query('SELECT * FROM rv_tenant WHERE id = ?', [req.params.id]);
  if (tenants.length === 0) return res.status(404).json({ success: false, message: 'Tenant not found.' });

  const [users] = await db.query(
    `SELECT ut.role, u.id, u.email, u.first_name, u.last_name, u.status
     FROM rv_user_tenant ut JOIN rv_users u ON ut.user_id = u.id
     WHERE ut.tenant_id = ?`,
    [req.params.id]
  );

  const [subscription] = await db.query(
    `SELECT s.*, p.code as plan_code, p.name_fr as plan_name
     FROM rv_subscription s JOIN rv_plan p ON s.plan_id = p.id
     WHERE s.tenant_id = ? ORDER BY s.created_at DESC LIMIT 1`,
    [req.params.id]
  );

  const [[stats]] = await db.query(
    `SELECT
      (SELECT COUNT(*) FROM rv_party WHERE tenant_id = ?) as parties,
      (SELECT COUNT(*) FROM rv_animal WHERE tenant_id = ?) as animals,
      (SELECT COUNT(*) FROM rv_encounter WHERE tenant_id = ?) as encounters,
      (SELECT COUNT(*) FROM rv_invoice WHERE tenant_id = ?) as invoices`,
    [req.params.id, req.params.id, req.params.id, req.params.id]
  );

  res.json({
    success: true,
    data: { ...tenants[0], users, subscription: subscription[0] || null, stats }
  });
}));

// PUT /admin/tenants/:id/toggle
router.put('/tenants/:id/toggle', asyncHandler(async (req, res) => {
  const [tenant] = await db.query('SELECT is_active FROM rv_tenant WHERE id = ?', [req.params.id]);
  if (tenant.length === 0) return res.status(404).json({ success: false, message: 'Tenant not found.' });
  const newStatus = tenant[0].is_active ? 0 : 1;
  await db.query('UPDATE rv_tenant SET is_active = ? WHERE id = ?', [newStatus, req.params.id]);
  res.json({ success: true, message: `Tenant ${newStatus ? 'activated' : 'deactivated'}.` });
}));

// GET /admin/subscriptions
router.get('/subscriptions', asyncHandler(async (req, res) => {
  const [subs] = await db.query(
    `SELECT s.*, t.name as tenant_name, p.name_fr as plan_name, p.code as plan_code
     FROM rv_subscription s
     JOIN rv_tenant t ON s.tenant_id = t.id
     JOIN rv_plan p ON s.plan_id = p.id
     ORDER BY s.created_at DESC`
  );
  res.json({ success: true, data: subs });
}));

// GET /admin/users
router.get('/users', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = (page - 1) * limit;

  const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM rv_users');
  const [users] = await db.query(
    `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.status, u.last_login_at, u.created_at,
            GROUP_CONCAT(t.name) as tenants
     FROM rv_users u
     LEFT JOIN rv_user_tenant ut ON u.id = ut.user_id
     LEFT JOIN rv_tenant t ON ut.tenant_id = t.id
     GROUP BY u.id
     ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  res.json({ success: true, data: users, total, page, limit });
}));

// GET /admin/demo-requests
router.get('/demo-requests', asyncHandler(async (req, res) => {
  const [demos] = await db.query('SELECT * FROM rv_demo_request ORDER BY created_at DESC');
  res.json({ success: true, data: demos });
}));

// PUT /admin/demo-requests/:id
router.put('/demo-requests/:id', updateDemoRequest, validate, asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  await db.query('UPDATE rv_demo_request SET status = ?, notes = ? WHERE id = ?', [status, notes || null, req.params.id]);
  res.json({ success: true, message: 'Demo request updated.' });
}));

// GET /admin/contacts
router.get('/contacts', asyncHandler(async (req, res) => {
  const [msgs] = await db.query('SELECT * FROM rv_contact_message ORDER BY created_at DESC');
  res.json({ success: true, data: msgs });
}));

module.exports = router;
