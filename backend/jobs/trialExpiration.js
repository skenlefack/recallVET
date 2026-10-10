const cron = require('node-cron');
const { expireTrials } = require('../services/subscriptionService');

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running trial expiration check...');
  const count = await expireTrials();
  console.log(`Trial expiration check complete. Expired: ${count}`);
});

console.log('Trial expiration cron job scheduled (daily at midnight)');
