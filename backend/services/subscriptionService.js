const db = require('../config/db');

/**
 * Check and expire overdue trials
 */
async function expireTrials() {
  try {
    const [result] = await db.query(
      `UPDATE rv_subscription SET status = 'expired'
       WHERE status = 'trialing' AND trial_ends_at < NOW()`
    );
    if (result.affectedRows > 0) {
      console.log(`Expired ${result.affectedRows} trial subscription(s)`);
    }
    return result.affectedRows;
  } catch (error) {
    console.error('Trial expiration error:', error.message);
    return 0;
  }
}

/**
 * Get subscription for a tenant
 */
async function getTenantSubscription(tenantId) {
  const [subs] = await db.query(
    `SELECT s.*, p.code as plan_code, p.name_fr as plan_name_fr, p.name_en as plan_name_en,
            p.price_monthly, p.price_yearly, p.max_users, p.max_animals, p.max_structures, p.features
     FROM rv_subscription s
     JOIN rv_plan p ON s.plan_id = p.id
     WHERE s.tenant_id = ?
     ORDER BY s.created_at DESC LIMIT 1`,
    [tenantId]
  );
  return subs[0] || null;
}

/**
 * Create trial subscription for new tenant
 */
async function createTrialSubscription(tenantId, planCode = 'professional') {
  const [plans] = await db.query('SELECT id, trial_days FROM rv_plan WHERE code = ?', [planCode]);
  if (plans.length === 0) throw new Error(`Plan '${planCode}' not found`);

  const plan = plans[0];
  const now = new Date();
  const trialEnd = new Date(now);
  trialEnd.setDate(trialEnd.getDate() + (plan.trial_days || 14));

  const [result] = await db.query(
    `INSERT INTO rv_subscription (tenant_id, plan_id, status, billing_cycle, trial_starts_at, trial_ends_at)
     VALUES (?, ?, 'trialing', 'monthly', ?, ?)`,
    [tenantId, plan.id, now.toISOString().split('T')[0], trialEnd.toISOString().split('T')[0]]
  );

  return result.insertId;
}

module.exports = { expireTrials, getTenantSubscription, createTrialSubscription };
