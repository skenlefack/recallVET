const db = require('../config/db');

/**
 * Verify tenant has an active subscription (trialing or active).
 * Must be used after requireTenant middleware.
 */
const requireActiveSubscription = async (req, res, next) => {
  try {
    const tenantId = req.tenant.id;

    const [subs] = await db.query(
      `SELECT s.id, s.status, s.plan_id, s.trial_ends_at, s.current_period_end,
              p.code as plan_code, p.name_fr as plan_name, p.features
       FROM rv_subscription s
       JOIN rv_plan p ON s.plan_id = p.id
       WHERE s.tenant_id = ?
       ORDER BY s.created_at DESC LIMIT 1`,
      [tenantId]
    );

    if (subs.length === 0) {
      return res.status(402).json({
        success: false,
        message: 'No subscription found. Please subscribe to continue.',
        code: 'NO_SUBSCRIPTION'
      });
    }

    const sub = subs[0];

    if (sub.status === 'expired' || sub.status === 'cancelled') {
      return res.status(402).json({
        success: false,
        message: 'Your subscription has expired. Please renew to continue.',
        code: 'SUBSCRIPTION_EXPIRED'
      });
    }

    if (sub.status === 'trialing' && sub.trial_ends_at) {
      const trialEnd = new Date(sub.trial_ends_at);
      if (trialEnd < new Date()) {
        await db.query('UPDATE rv_subscription SET status = ? WHERE id = ?', ['expired', sub.id]);
        return res.status(402).json({
          success: false,
          message: 'Your trial has expired. Please subscribe to continue.',
          code: 'TRIAL_EXPIRED'
        });
      }
    }

    req.subscription = {
      id: sub.id,
      status: sub.status,
      planCode: sub.plan_code,
      planName: sub.plan_name,
      features: typeof sub.features === 'string' ? JSON.parse(sub.features) : sub.features
    };

    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ success: false, message: 'Subscription verification error' });
  }
};

module.exports = { requireActiveSubscription };
