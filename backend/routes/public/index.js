const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const validate = require('../../middleware/validate');
const { demoRequest, contact, newsletterSubscribe } = require('../../validators/public');
const asyncHandler = require('../../utils/asyncHandler');

// GET /public/plans - Get all active pricing plans
router.get('/plans', asyncHandler(async (req, res) => {
  const [plans] = await db.query(
    'SELECT id, code, name_fr, name_en, description_fr, description_en, price_monthly, price_yearly, currency, max_users, max_animals, max_structures, features, trial_days, sort_order FROM rv_plan WHERE is_active = 1 ORDER BY sort_order'
  );
  res.json({ success: true, data: plans });
}));

// POST /public/demo-request
router.post('/demo-request', demoRequest, validate, asyncHandler(async (req, res) => {
  const { full_name, email, phone, practice_name, practice_type, country_code, message } = req.body;
  await db.query(
    `INSERT INTO rv_demo_request (full_name, email, phone, practice_name, practice_type, country_code, message)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [full_name, email, phone || null, practice_name || null, practice_type || 'clinic', country_code || 'CM', message || null]
  );
  res.status(201).json({ success: true, message: 'Demo request submitted successfully.' });
}));

// POST /public/contact
router.post('/contact', contact, validate, asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  await db.query(
    'INSERT INTO rv_contact_message (name, email, subject, message) VALUES (?, ?, ?, ?)',
    [name, email, subject || null, message]
  );
  res.status(201).json({ success: true, message: 'Message sent successfully.' });
}));

// POST /public/newsletter/subscribe
router.post('/newsletter/subscribe', newsletterSubscribe, validate, asyncHandler(async (req, res) => {
  const { email, language } = req.body;
  await db.query(
    `INSERT INTO rv_newsletter_subscriber (email, language) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE is_active = 1, unsubscribed_at = NULL`,
    [email, language || 'fr']
  );
  res.status(201).json({ success: true, message: 'Subscribed successfully.' });
}));

// POST /public/newsletter/unsubscribe
router.post('/newsletter/unsubscribe', asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (email) {
    await db.query(
      'UPDATE rv_newsletter_subscriber SET is_active = 0, unsubscribed_at = NOW() WHERE email = ? AND is_active = 1',
      [email]
    );
  }
  res.json({ success: true, message: 'Unsubscribed successfully.' });
}));

module.exports = router;
