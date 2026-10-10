/**
 * SMS Service - Stub for Africa's Talking / Twilio
 * Configure SMS_PROVIDER and SMS_API_KEY in .env to enable
 */

function isSMSConfigured() {
  return !!(process.env.SMS_PROVIDER && process.env.SMS_API_KEY);
}

async function sendSMS({ to, message }) {
  if (!isSMSConfigured()) {
    console.warn('SMS not configured — set SMS_PROVIDER and SMS_API_KEY in .env');
    return { sent: false, reason: 'SMS provider not configured' };
  }

  const provider = process.env.SMS_PROVIDER.toLowerCase();

  switch (provider) {
    case 'africas_talking': {
      // TODO: Install africastalking SDK or use fetch
      // const AfricasTalking = require('africastalking')({
      //   apiKey: process.env.SMS_API_KEY,
      //   username: process.env.SMS_API_SECRET
      // });
      // const sms = AfricasTalking.SMS;
      // await sms.send({ to: [to], message, from: process.env.SMS_SENDER_ID });
      console.log(`[SMS/AfricasTalking] Would send to ${to}: ${message}`);
      return { sent: false, reason: 'Provider integration pending' };
    }

    case 'twilio': {
      // TODO: Install twilio SDK or use fetch
      // const accountSid = process.env.SMS_API_KEY;
      // const authToken = process.env.SMS_API_SECRET;
      // const client = require('twilio')(accountSid, authToken);
      // await client.messages.create({
      //   body: message,
      //   from: process.env.SMS_SENDER_ID,
      //   to
      // });
      console.log(`[SMS/Twilio] Would send to ${to}: ${message}`);
      return { sent: false, reason: 'Provider integration pending' };
    }

    default:
      console.warn(`[SMS] Unknown provider: ${provider}`);
      return { sent: false, reason: `Unknown SMS provider: ${provider}` };
  }
}

module.exports = { sendSMS, isSMSConfigured };
