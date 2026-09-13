const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const { requireTenant } = require('../../middleware/tenantAuth');
const { requireActiveSubscription } = require('../../middleware/subscription');

// All v1 routes require auth + active subscription + tenant context
router.use(auth, requireTenant, requireActiveSubscription);

// Module routers
router.use('/clinic', require('./clinic'));
router.use('/farm', require('./farm'));
router.use('/pharmacy', require('./pharmacy'));
router.use('/notifications', require('./notifications'));
router.use('/team', require('./team'));
router.use('/tenant', require('./tenant'));
router.use('/exports', require('./exports'));
router.use('/analytics', require('./analytics'));
router.use('/uploads', require('./uploads'));
router.use('/search', require('./search'));
router.use('/reference', require('./reference'));

// Tenant context endpoint (returns full auth context)
router.get('/tenant-context', (req, res) => {
  res.json({
    success: true,
    data: {
      tenant: req.tenant,
      role: req.rvRole,
      structure: req.structure,
      site: req.site,
      subscription: req.subscription
    }
  });
});

module.exports = router;
