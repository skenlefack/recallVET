const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  return transporter;
}

async function sendEmail({ to, subject, html, text }) {
  try {
    const t = getTransporter();
    await t.sendMail({
      from: process.env.SMTP_FROM || 'noreply@recallvet.com',
      to,
      subject,
      html,
      text
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error.message);
    return false;
  }
}

async function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: 'Bienvenue sur RecallVET / Welcome to RecallVET',
    html: `
      <h2>Bienvenue ${user.first_name} !</h2>
      <p>Votre compte RecallVET a ete cree avec succes.</p>
      <p>Vous beneficiez d'un essai gratuit de 14 jours avec toutes les fonctionnalites.</p>
      <p>Connectez-vous sur <a href="${process.env.ADMIN_URL || 'https://app.recallvet.com'}">${process.env.ADMIN_URL || 'app.recallvet.com'}</a></p>
      <hr>
      <h2>Welcome ${user.first_name}!</h2>
      <p>Your RecallVET account has been created successfully.</p>
      <p>You have a 14-day free trial with all features.</p>
    `
  });
}

async function sendPasswordResetEmail(user, resetToken) {
  const resetUrl = `${process.env.ADMIN_URL || 'https://app.recallvet.com'}/reset-password/${resetToken}`;
  return sendEmail({
    to: user.email,
    subject: 'RecallVET - Reinitialisation du mot de passe',
    html: `
      <h2>Reinitialisation du mot de passe</h2>
      <p>Bonjour ${user.first_name},</p>
      <p>Cliquez sur le lien ci-dessous pour reinitialiser votre mot de passe :</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Ce lien expire dans 1 heure.</p>
      <p>Si vous n'avez pas demande cette reinitialisation, ignorez cet email.</p>
    `
  });
}

async function sendInvitationEmail({ email, inviterName, tenantName, token }) {
  const inviteUrl = `${process.env.ADMIN_URL || 'https://app.recallvet.com'}/accept-invite?token=${token}`;
  return sendEmail({
    to: email,
    subject: `RecallVET - Invitation a rejoindre ${tenantName}`,
    html: `
      <h2>Vous etes invite a rejoindre ${tenantName} sur RecallVET</h2>
      <p>${inviterName} vous invite a rejoindre son equipe sur RecallVET.</p>
      <p>Cliquez sur le lien ci-dessous pour accepter l'invitation :</p>
      <p><a href="${inviteUrl}" style="display:inline-block;padding:12px 24px;background:#28a745;color:white;text-decoration:none;border-radius:4px;">Accepter l'invitation</a></p>
      <p>Ou copiez ce lien : ${inviteUrl}</p>
      <p>Cette invitation expire dans 7 jours.</p>
      <hr>
      <h2>You've been invited to join ${tenantName} on RecallVET</h2>
      <p>${inviterName} has invited you to join their team on RecallVET.</p>
      <p>Click the link above to accept the invitation.</p>
      <p>This invitation expires in 7 days.</p>
    `
  });
}

async function sendAppointmentReminder({ to, ownerName, animalName, clinicName, vetName, date, time }) {
  const timeInfo = time ? `<strong>Heure :</strong> ${time}` : '<em>Heure a confirmer</em>';
  return sendEmail({
    to,
    subject: `RecallVET - Rappel de rendez-vous pour ${animalName}`,
    html: `
      <h2>Rappel de rendez-vous</h2>
      <p>Bonjour ${ownerName},</p>
      <p>Nous vous rappelons que vous avez un rendez-vous prevu demain pour <strong>${animalName}</strong>.</p>
      <table style="border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:6px 12px;font-weight:bold;">Clinique :</td><td style="padding:6px 12px;">${clinicName}</td></tr>
        ${vetName ? `<tr><td style="padding:6px 12px;font-weight:bold;">Veterinaire :</td><td style="padding:6px 12px;">Dr ${vetName}</td></tr>` : ''}
        <tr><td style="padding:6px 12px;font-weight:bold;">Date :</td><td style="padding:6px 12px;">${date}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;">${timeInfo}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;">Animal :</td><td style="padding:6px 12px;">${animalName}</td></tr>
      </table>
      <p>Si vous devez annuler ou reporter ce rendez-vous, veuillez nous contacter au plus vite.</p>
      <p>Cordialement,<br>${clinicName} - RecallVET</p>
    `
  });
}

module.exports = { sendEmail, sendWelcomeEmail, sendPasswordResetEmail, sendInvitationEmail, sendAppointmentReminder };
