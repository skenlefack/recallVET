const { body, param } = require('express-validator');

const updateDemoRequest = [
  param('id').isInt({ min: 1 }).withMessage('Invalid ID.'),
  body('status').isIn(['pending', 'contacted', 'scheduled', 'completed', 'rejected']).withMessage('Invalid status.'),
  body('notes').optional({ values: 'falsy' }).trim()
];

module.exports = { updateDemoRequest };
