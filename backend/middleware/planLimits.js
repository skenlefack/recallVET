const db = require('../config/db');

/**
 * Check that the tenant has not exceeded their plan limit for a given resource.
 * Must be used after requireTenant middleware.
 *
 * @param {'users'|'animals'|'structures'} resourceType
 */
const checkPlanLimit = (resourceType) => {
  const countQueries = {
    users: 'SELECT COUNT(*) AS cnt FROM rv_user_tenant WHERE tenant_id = ?',
    animals: 'SELECT COUNT(*) AS cnt FROM rv_animal WHERE tenant_id = ? AND is_alive = 1',
    structures: 'SELECT COUNT(*) AS cnt FROM rv_structure WHERE tenant_id = ?'
  };

  const columnMap = {
    users: 'max_users',
    animals: 'max_animals',
    structures: 'max_structures'
  };

  return async (req, res, next) => {
    try {
      const tenantId = req.tenant.id;

      // 1. Get active subscription + plan limits
      const [subs] = await db.query(
        `SELECT p.max_users, p.max_animals, p.max_structures
         FROM rv_subscription s
         JOIN rv_plan p ON s.plan_id = p.id
         WHERE s.tenant_id = ? AND s.status IN ('active', 'trialing')
         ORDER BY s.created_at DESC LIMIT 1`,
        [tenantId]
      );

      // No subscription found — let subscription middleware handle it
      if (subs.length === 0) return next();

      const maxLimit = subs[0][columnMap[resourceType]];

      // NULL, 0, or negative means unlimited
      if (maxLimit === null || maxLimit <= 0) return next();

      // 2. Count current resources
      const [[{ cnt }]] = await db.query(countQueries[resourceType], [tenantId]);

      // 3. Enforce limit
      if (cnt >= maxLimit) {
        return res.status(403).json({
          success: false,
          code: 'PLAN_LIMIT_REACHED',
          message: `Limite du plan atteinte. Votre plan autorise maximum ${maxLimit} ${resourceType}. Passez à un plan supérieur.`
        });
      }

      next();
    } catch (error) {
      console.error('Plan limit check error:', error);
      res.status(500).json({ success: false, message: 'Plan limit verification error' });
    }
  };
};

module.exports = { checkPlanLimit };
