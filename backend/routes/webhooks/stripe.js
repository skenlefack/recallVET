const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { handleWebhookEvent } = require('../../services/stripeService');
const logger = require('../../services/logger');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/webhooks/stripe
router.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    logger.warn(`Stripe webhook signature verification failed: ${err.message}`);
    return res.status(400).json({ success: false, message: 'Webhook signature verification failed.' });
  }

  try {
    await handleWebhookEvent(event);
    res.json({ received: true });
  } catch (err) {
    logger.error(`Stripe webhook processing error: ${err.message}`, { error: err });
    res.status(500).json({ success: false, message: 'Webhook processing error.' });
  }
});

module.exports = router;
