const { body } = require('express-validator');

const demoRequest = [
  body('full_name').trim().notEmpty().withMessage('Full name is required.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('phone').optional({ values: 'falsy' }).trim(),
  body('practice_name').optional({ values: 'falsy' }).trim(),
  body('practice_type').optional({ values: 'falsy' }).isIn(['clinic', 'farm', 'mixed', 'pharmacy', 'laboratory']),
  body('country_code').optional({ values: 'falsy' }).isLength({ min: 2, max: 3 })
];

const contact = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('message').trim().notEmpty().withMessage('Message is required.'),
  body('subject').optional({ values: 'falsy' }).trim()
];

const newsletterSubscribe = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('language').optional({ values: 'falsy' }).isIn(['fr', 'en'])
];

module.exports = { demoRequest, contact, newsletterSubscribe };
