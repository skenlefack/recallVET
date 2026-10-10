/**
 * WhatsApp Service - Stub for WhatsApp Business API
 * Configure WHATSAPP_API_URL and WHATSAPP_API_TOKEN in .env to enable
 */

function isWhatsAppConfigured() {
  return !!(process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_TOKEN);
}

async function sendWhatsApp({ to, message }) {
  if (!isWhatsAppConfigured()) {
    console.warn('WhatsApp not configured — set WHATSAPP_API_URL and WHATSAPP_API_TOKEN in .env');
    return { sent: false, reason: 'WhatsApp not configured' };
  }

  // TODO: Implement actual WhatsApp Business API call
  // const response = await fetch(
  //   `${process.env.WHATSAPP_API_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
  //   {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({
  //       messaging_product: 'whatsapp',
  //       to,
  //       type: 'text',
  //       text: { body: message }
  //     })
  //   }
  // );
  console.log(`[WhatsApp] Would send to ${to}: ${message}`);
  return { sent: false, reason: 'Provider integration pending' };
}

module.exports = { sendWhatsApp, isWhatsAppConfigured };
