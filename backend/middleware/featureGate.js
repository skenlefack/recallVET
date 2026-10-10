/**
 * Feature-gating middleware.
 * Checks whether the tenant's plan includes a specific feature.
 * Must be used AFTER requireActiveSubscription (which sets req.subscription.features).
 */
const db = require('../config/db');

/**
 * Returns middleware that blocks access when the tenant's plan
 * explicitly disables the given feature.
 *
 * Logic:
 *  - features[featureName] === false  → 403
 *  - features[featureName] is true / undefined / features column is null → allow
 */
const requireFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      // Prefer features already loaded by requireActiveSubscription
      let features = req.subscription && req.subscription.features;

      // Fallback: query the DB directly (in case middleware order differs)
      if (features === undefined || features === null) {
        const [rows] = await db.query(
          `SELECT p.features
           FROM rv_subscription s
           JOIN rv_plan p ON s.plan_id = p.id
           WHERE s.tenant_id = ? AND s.status IN ('active', 'trialing')
           LIMIT 1`,
          [req.tenant.id]
        );

        if (rows.length === 0) {
          return next(); // no subscription — let other middleware handle it
        }

        features = typeof rows[0].features === 'string'
          ? JSON.parse(rows[0].features)
          : rows[0].features;
      }

      if (features && features[featureName] === false) {
        return res.status(403).json({
          success: false,
          message:
            "Cette fonctionnalité n'est pas incluse dans votre plan. Passez à un plan supérieur pour y accéder.",
          code: 'FEATURE_NOT_AVAILABLE'
        });
      }

      next();
    } catch (error) {
      console.error('Feature gate error:', error);
      res.status(500).json({ success: false, message: 'Feature verification error' });
    }
  };
};

module.exports = { requireFeature };
