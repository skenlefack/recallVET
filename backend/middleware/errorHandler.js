const logger = require('../services/logger');

/**
 * Centralized error handler. Catches all errors forwarded by asyncHandler or next(err).
 */
const errorHandler = (err, req, res, _next) => {
  // Log with context
  logger.error(err.message || 'Unhandled error', {
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id || null,
    tenantId: req.tenant?.id || null
  });

  // Duplicate entry (MySQL 1062)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists.'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }

  // Default 500
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error.' : err.message
  });
};

module.exports = errorHandler;
