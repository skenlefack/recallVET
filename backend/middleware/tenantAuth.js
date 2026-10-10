const db = require('../config/db');

/**
 * Resolve user's tenant context after auth.
 * Attaches req.tenant, req.rvRole, req.structure, req.site
 * Accepts optional X-Tenant-Id header for multi-tenant users.
 */
const requireTenant = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const requestedTenantId = req.headers['x-tenant-id'];

    let query = `
      SELECT ut.id, ut.tenant_id, ut.structure_id, ut.site_id, ut.role,
             t.name as tenant_name, t.slug as tenant_slug, t.default_currency, t.default_language,
             s.name as structure_name, s.type as structure_type,
             si.name as site_name
      FROM rv_user_tenant ut
      JOIN rv_tenant t ON ut.tenant_id = t.id AND t.is_active = 1
      LEFT JOIN rv_structure s ON ut.structure_id = s.id
      LEFT JOIN rv_site si ON ut.site_id = si.id
      WHERE ut.user_id = ? AND ut.is_active = 1
    `;
    const params = [userId];

    if (requestedTenantId) {
      query += ' AND ut.tenant_id = ?';
      params.push(requestedTenantId);
    }

    query += ' LIMIT 1';

    const [rows] = await db.query(query, params);

    if (rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'No active RecallVET tenant associated with your account.'
      });
    }

    const ut = rows[0];
    req.tenant = {
      id: ut.tenant_id,
      name: ut.tenant_name,
      slug: ut.tenant_slug,
      currency: ut.default_currency,
      language: ut.default_language
    };
    req.rvRole = ut.role;
    req.structure = ut.structure_id ? { id: ut.structure_id, name: ut.structure_name, type: ut.structure_type } : null;
    req.site = ut.site_id ? { id: ut.site_id, name: ut.site_name } : null;

    next();
  } catch (error) {
    console.error('Tenant auth error:', error);
    res.status(500).json({ success: false, message: 'Tenant authentication error' });
  }
};

/**
 * Restrict to specific RecallVET roles
 */
const requireRvRole = (...roles) => {
  return (req, res, next) => {
    if (req.user.role === 'superadmin' || roles.includes(req.rvRole)) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: 'You do not have the required RecallVET role.'
    });
  };
};

module.exports = { requireTenant, requireRvRole };
