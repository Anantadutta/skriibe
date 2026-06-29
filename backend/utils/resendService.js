const { Resend } = require('resend');

const sendFollowUpEmail = async (creatorEmail, creatorName, fanName, questionText, orderNumber) => {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const senderEmail = process.env.RESEND_SENDER_EMAIL || 'onboarding@resend.dev';

    if (!apiKey) {
      console.warn('Resend API key not configured, skipping actual email send.');
      console.log(`[MOCK EMAIL] To: ${creatorEmail}, Follow-up from ${fanName}`);
      return true;
    }

    const resend = new Resend(apiKey);

    const data = await resend.emails.send({
      from: `Skriibe <${senderEmail}>`,
      to: creatorEmail,
      subject: `You have a new follow-up question!`,
      html: `<html><body style="font-family: sans-serif; color: #333;"><p>Hi ${creatorName || 'Creator'},</p><p><strong>${fanName || 'A fan'}</strong> has just asked a follow-up question regarding order #${orderNumber}.</p><p><strong>Their message:</strong></p><blockquote style="border-left: 4px solid #ccc; padding-left: 10px; color: #555;">${questionText}</blockquote><div style="margin-top: 24px;"><a href="https://skriibe.com/creator/login" style="display: inline-block; padding: 14px 28px; background-color: #29C5F6; color: #0E0E0E; text-decoration: none; font-weight: bold; border-radius: 12px;">Click here to login to your dashboard</a></div></body></html>`
    });

    console.log('Resend follow-up email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error sending Resend follow-up email:', error);
    throw error;
  }
};

module.exports = { sendFollowUpEmail };
