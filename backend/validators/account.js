const { body } = require('express-validator');

const updateProfile = [
  body('first_name').trim().notEmpty().withMessage('First name is required.'),
  body('last_name').trim().notEmpty().withMessage('Last name is required.'),
  body('phone').optional({ values: 'falsy' }).trim(),
  body('preferred_language').optional({ values: 'falsy' }).isIn(['fr', 'en']).withMessage('Language must be fr or en.')
];

const changePassword = [
  body('current_password').notEmpty().withMessage('Current password is required.'),
  body('new_password').isLength({ min: 8 }).withMessage('New password must be at least 8 characters.')
];

module.exports = { updateProfile, changePassword };
