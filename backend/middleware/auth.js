const jwt = require('jsonwebtoken');
const db = require('../config/db');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET environment variable must be set (min 32 characters).');
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET + '_refresh';

// Generate access token (short-lived)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Generate refresh token (long-lived)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );
};

// Auth middleware - verify JWT and attach user
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const [users] = await db.query(
      'SELECT id, email, first_name, last_name, role, status, preferred_language, avatar_url FROM rv_users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    if (users[0].status !== 'active') {
      return res.status(401).json({ success: false, message: 'Account is not active.' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.' });
    }
    res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

// Role-based access - superadmin bypasses all
const authorize = (...roles) => {
  return (req, res, next) => {
    if (req.user.role === 'superadmin' || roles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to perform this action.'
    });
  };
};

// Optional auth - attach user if token valid, continue either way
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const [users] = await db.query(
        'SELECT id, email, first_name, last_name, role, status FROM rv_users WHERE id = ?',
        [decoded.id]
      );
      if (users.length > 0) {
        req.user = users[0];
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = { auth, authorize, optionalAuth, generateAccessToken, generateRefreshToken, JWT_SECRET, JWT_REFRESH_SECRET };
