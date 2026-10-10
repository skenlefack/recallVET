const cron = require('node-cron');
const db = require('../config/db');
const { sendAppointmentReminder } = require('../services/emailService');
const { createNotification } = require('../services/notificationService');
const { sendMessage } = require('../services/messagingService');

// Run every day at 8:00 AM
cron.schedule('0 8 * * *', async () => {
  console.log('Running appointment reminder check...');

  try {
    const [appointments] = await db.query(`
      SELECT a.*, an.name as animal_name, an.species,
             p.display_name as owner_name, p.email as owner_email, p.phone_primary as owner_phone,
             p.preferred_channel,
             t.name as clinic_name,
             CONCAT(u.first_name, ' ', u.last_name) as vet_name
      FROM rv_appointment a
      JOIN rv_animal an ON a.animal_id = an.id
      JOIN rv_party p ON a.party_id = p.id
      JOIN rv_tenant t ON a.tenant_id = t.id
      LEFT JOIN rv_users u ON a.vet_user_id = u.id
      WHERE a.send_reminder = 1
        AND DATE(a.scheduled_date) = CURDATE() + INTERVAL 1 DAY
        AND a.status IN ('confirmed', 'scheduled')
    `);

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const appt of appointments) {
      try {
        const channel = appt.reminder_channel || appt.preferred_channel || 'email';
        const date = new Date(appt.scheduled_date).toLocaleDateString('fr-FR', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        const time = appt.start_time
          ? appt.start_time.substring(0, 5)
          : null;

        switch (channel) {
          case 'email':
            if (!appt.owner_email) {
              console.warn(`Appointment #${appt.id}: no email address for owner "${appt.owner_name}"`);
              skipped++;
              break;
            }
            const emailSent = await sendAppointmentReminder({
              to: appt.owner_email,
              ownerName: appt.owner_name,
              animalName: appt.animal_name,
              clinicName: appt.clinic_name,
              vetName: appt.vet_name,
              date,
              time
            });
            if (emailSent) {
              sent++;
            } else {
              failed++;
            }
            break;

          case 'sms':
          case 'phone':
          case 'whatsapp':
            const msgText = `Rappel RecallVET: RDV demain ${date}${time ? ' a ' + time : ''} pour ${appt.animal_name} a ${appt.clinic_name}`;
            const result = await sendMessage({ channel, to: appt.owner_phone || appt.owner_email, message: msgText });
            result.sent ? sent++ : skipped++;
            break;

          default:
            console.warn(`Appointment #${appt.id}: unknown channel "${channel}"`);
            skipped++;
        }

        // Create in-app notification for the vet
        if (appt.vet_user_id) {
          await createNotification(appt.tenant_id, appt.vet_user_id, {
            type: 'info',
            title: 'Rappel: rendez-vous demain',
            body: `${appt.animal_name} (${appt.owner_name}) - ${date}${time ? ' a ' + time : ''}`,
            event_type: 'appointment_reminder',
            data: { appointment_id: appt.id, animal_id: appt.animal_id }
          });
        }
      } catch (err) {
        console.error(`Appointment #${appt.id} reminder failed:`, err.message);
        failed++;
      }
    }

    console.log(`Appointment reminders complete. Total: ${appointments.length}, Sent: ${sent}, Skipped: ${skipped}, Failed: ${failed}`);
  } catch (err) {
    console.error('Appointment reminder job error:', err.message);
  }
});

console.log('Appointment reminder cron job scheduled (daily at 8:00 AM)');
