const Stripe = require('stripe');
const db = require('../config/db');
const logger = require('./logger');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe customer and save the customer ID to rv_tenant.
 */
async function createCustomer(tenantId, email, name) {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { tenant_id: tenantId }
  });

  await db.query(
    'UPDATE rv_tenant SET stripe_customer_id = ? WHERE id = ?',
    [customer.id, tenantId]
  );

  return customer;
}

/**
 * Create a Stripe Checkout session for a subscription.
 */
async function createCheckoutSession(tenantId, priceId, successUrl, cancelUrl) {
  // Get or create Stripe customer
  const [tenants] = await db.query(
    'SELECT id, stripe_customer_id, name, email FROM rv_tenant WHERE id = ?',
    [tenantId]
  );

  if (tenants.length === 0) {
    throw new Error('Tenant not found');
  }

  const tenant = tenants[0];
  let stripeCustomerId = tenant.stripe_customer_id;

  if (!stripeCustomerId) {
    const customer = await createCustomer(tenantId, tenant.email, tenant.name);
    stripeCustomerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { tenant_id: tenantId }
  });

  return session;
}

/**
 * Create a Stripe Billing Portal session.
 */
async function createBillingPortalSession(stripeCustomerId, returnUrl) {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl
  });

  return session;
}

/**
 * Process incoming Stripe webhook events.
 */
async function handleWebhookEvent(event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const tenantId = session.metadata.tenant_id;
      const stripeSubscriptionId = session.subscription;

      if (!tenantId || !stripeSubscriptionId) break;

      // Fetch the subscription from Stripe to get details
      const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      const priceId = stripeSub.items.data[0]?.price?.id;

      // Look up the plan by stripe_price_id or activate existing subscription
      const periodStart = new Date(stripeSub.current_period_start * 1000).toISOString().slice(0, 10);
      const periodEnd = new Date(stripeSub.current_period_end * 1000).toISOString().slice(0, 10);

      // Update existing subscription for this tenant
      await db.query(
        `UPDATE rv_subscription
         SET status = 'active',
             stripe_subscription_id = ?,
             stripe_price_id = ?,
             current_period_start = ?,
             current_period_end = ?,
             cancel_at_period_end = 0,
             start_date = COALESCE(start_date, CURDATE())
         WHERE tenant_id = ?
         ORDER BY created_at DESC LIMIT 1`,
        [stripeSubscriptionId, priceId, periodStart, periodEnd, tenantId]
      );

      logger.info(`Checkout completed for tenant ${tenantId}, subscription ${stripeSubscriptionId}`);
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const stripeSubscriptionId = subscription.id;
      const status = subscription.status; // active, past_due, canceled, etc.
      const periodStart = new Date(subscription.current_period_start * 1000).toISOString().slice(0, 10);
      const periodEnd = new Date(subscription.current_period_end * 1000).toISOString().slice(0, 10);
      const cancelAtPeriodEnd = subscription.cancel_at_period_end ? 1 : 0;

      // Map Stripe status to our status
      let dbStatus = status;
      if (status === 'active') dbStatus = 'active';
      else if (status === 'past_due') dbStatus = 'past_due';
      else if (status === 'canceled') dbStatus = 'cancelled';

      await db.query(
        `UPDATE rv_subscription
         SET status = ?,
             current_period_start = ?,
             current_period_end = ?,
             cancel_at_period_end = ?
         WHERE stripe_subscription_id = ?`,
        [dbStatus, periodStart, periodEnd, cancelAtPeriodEnd, stripeSubscriptionId]
      );

      logger.info(`Subscription updated: ${stripeSubscriptionId}, status: ${dbStatus}`);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const stripeSubscriptionId = subscription.id;

      await db.query(
        `UPDATE rv_subscription
         SET status = 'cancelled',
             cancel_at_period_end = 0,
             end_date = CURDATE()
         WHERE stripe_subscription_id = ?`,
        [stripeSubscriptionId]
      );

      logger.info(`Subscription cancelled: ${stripeSubscriptionId}`);
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object;
      const stripeCustomerId = invoice.customer;
      const amountPaid = invoice.amount_paid / 100; // Convert from cents

      // Find tenant by stripe_customer_id
      const [tenants] = await db.query(
        'SELECT id FROM rv_tenant WHERE stripe_customer_id = ?',
        [stripeCustomerId]
      );

      if (tenants.length > 0) {
        const tenantId = tenants[0].id;

        // Log the payment in rv_saas_payment if invoice exists
        const [invoices] = await db.query(
          'SELECT id FROM rv_saas_invoice WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 1',
          [tenantId]
        );

        if (invoices.length > 0) {
          await db.query(
            `INSERT INTO rv_saas_payment (invoice_id, amount, payment_method, payment_date, stripe_payment_intent_id)
             VALUES (?, ?, 'stripe', NOW(), ?)
             ON DUPLICATE KEY UPDATE amount = VALUES(amount)`,
            [invoices[0].id, amountPaid, invoice.payment_intent]
          );
        }

        logger.info(`Invoice paid for tenant ${tenantId}: $${amountPaid}`);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const stripeSubscriptionId = invoice.subscription;

      if (stripeSubscriptionId) {
        await db.query(
          `UPDATE rv_subscription SET status = 'past_due' WHERE stripe_subscription_id = ?`,
          [stripeSubscriptionId]
        );

        logger.warn(`Payment failed for subscription: ${stripeSubscriptionId}`);
      }
      break;
    }

    default:
      logger.info(`Unhandled Stripe webhook event: ${event.type}`);
  }
}

module.exports = {
  createCustomer,
  createCheckoutSession,
  createBillingPortalSession,
  handleWebhookEvent
};
