const axios = require('axios');

const sendEmailOtp = async (toEmail, otpCode) => {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;

    if (!apiKey || !senderEmail) {
      console.warn('Brevo API key or sender email not configured, skipping actual email send.');
      console.log(`[MOCK EMAIL] To: ${toEmail}, OTP: ${otpCode}`);
      return true;
    }

    const payload = {
      sender: {
        name: "Skriibe",
        email: senderEmail
      },
      to: [
        { email: toEmail }
      ],
      subject: "Your Verification Code",
      htmlContent: `<html><body><p>Hello,</p><p>Your verification code is <strong>${otpCode}</strong>.</p><p>This code will expire in 5 minutes.</p></body></html>`
    };

    const response = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('Brevo email sent successfully:', response.data);
    return true;
  } catch (error) {
    console.error('Error sending Brevo email:', error.response?.data || error.message);
    throw error;
module.exports = { sendEmailOtp };
