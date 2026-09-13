const { body } = require('express-validator');

const register = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  body('first_name').trim().notEmpty().withMessage('First name is required.'),
  body('last_name').trim().notEmpty().withMessage('Last name is required.'),
  body('phone').optional({ values: 'falsy' }).trim(),
  body('practice_name').optional({ values: 'falsy' }).trim(),
  body('practice_type').optional({ values: 'falsy' }).isIn(['clinic', 'farm', 'mixed', 'pharmacy', 'laboratory']).withMessage('Invalid practice type.'),
  body('country_code').optional({ values: 'falsy' }).isLength({ min: 2, max: 3 }).withMessage('Invalid country code.'),
  body('preferred_language').optional({ values: 'falsy' }).isIn(['fr', 'en']).withMessage('Language must be fr or en.')
];

const login = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.')
];

const refresh = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required.')
];

const forgotPassword = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.')
];

const resetPassword = [
  body('token').notEmpty().withMessage('Reset token is required.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
];

module.exports = { register, login, refresh, forgotPassword, resetPassword };
