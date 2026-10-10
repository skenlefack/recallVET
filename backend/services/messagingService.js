/**
 * Unified Messaging Service
 * Routes messages to the appropriate channel (email, SMS, WhatsApp, phone)
 */

const { sendEmail } = require('./emailService');
const { sendSMS, isSMSConfigured } = require('./smsService');
const { sendWhatsApp, isWhatsAppConfigured } = require('./whatsappService');

/**
 * Send a message via the specified channel
 * @param {Object} params
 * @param {'email'|'sms'|'whatsapp'|'phone'} params.channel
 * @param {string} params.to - Recipient (email address or phone number)
 * @param {string} params.message - Message body
 * @param {string} [params.subject] - Email subject (email channel only)
 */
async function sendMessage({ channel, to, message, subject }) {
  switch (channel) {
    case 'email':
      return sendEmail({
        to,
        subject: subject || 'RecallVET Notification',
        html: `<p>${message}</p>`,
        text: message
      });

    case 'sms':
      return sendSMS({ to, message });

    case 'whatsapp':
      return sendWhatsApp({ to, message });

    case 'phone':
      console.log(`[Phone] Manual call required to ${to}: ${message}`);
      return { sent: false, reason: 'Phone calls require manual action' };

    default:
      console.warn(`[Messaging] Unknown channel "${channel}", falling back to email`);
      return sendEmail({
        to,
        subject: subject || 'RecallVET Notification',
        html: `<p>${message}</p>`,
        text: message
      });
  }
}

/**
 * Returns which messaging channels are currently configured
 */
function getAvailableChannels() {
  const channels = [
    { channel: 'email', configured: !!(process.env.SMTP_USER && process.env.SMTP_PASS) },
    { channel: 'sms', configured: isSMSConfigured() },
    { channel: 'whatsapp', configured: isWhatsAppConfigured() },
    { channel: 'phone', configured: false } // always manual
  ];
  return channels;
}

module.exports = { sendMessage, getAvailableChannels };
