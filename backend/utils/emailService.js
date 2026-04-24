const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass || user.includes('your-email') || pass.includes('your-app-password')) {
    console.error('CRITICAL: Email credentials missing or still placeholders in .env:', {
      user: user ? 'Present' : 'Missing',
      pass: pass ? 'Present' : 'Missing'
    });
    return null;
  }

  console.log(`Initializing email transporter for: ${user}`);
  
  // Using explicit host/port for Gmail as it's often more reliable than the 'service' shortcut
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: user,
      pass: pass,
    },
  });

  return transporter;
};

/**
 * Sends a professional welcome email to a user who joined the waitlist.
 * @param {string} userEmail - The recipient's email address.
 * @param {string} userName - The recipient's name.
 */
const sendWelcomeEmail = async (userEmail, userName) => {
  const currentTransporter = getTransporter();
  
  if (!currentTransporter) {
    throw new Error('Email transporter not initialized. Check your .env file for EMAIL_USER and EMAIL_PASS.');
  }

  const mailOptions = {
    from: `"Skriibe Team" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Welcome to the skriibe Waiting List!',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1; margin-bottom: 10px;">skriibe</h1>
          <p style="color: #666; font-size: 16px;">The future of content creation</p>
        </div>
        
        <div style="padding: 20px; color: #333; line-height: 1.6;">
          <h2 style="color: #1f2937;">Hello ${userName},</h2>
          <p>Thank you so much for joining the <strong>skriibe Waiting List</strong>! We're thrilled to have you with us.</p>
          <p>skriibe is designed to help creators like you amplify their reach and streamline their workflow. As we gear up for our official launch, we'll keep you updated on our progress and let you know as soon as early access becomes available.</p>
          
          <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #6366f1; text-align: center;">
            <p style="margin: 0; font-weight: bold; color: #4b5563;">Status: Waitlist Confirmed ✅</p>
          </div>
          
          <p style="margin-top: 30px;">In the meantime, feel free to follow us for updates and behind-the-scenes content.</p>
        </div>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee; text-align: center; color: #999; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} skriibe. All rights reserved.</p>
          <p>If you didn't sign up for this list, please ignore this email.</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await currentTransporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Rethrow or handle as needed, but for waitlist, we don't want to crash the process
    throw error;
  }
};

module.exports = {
  sendWelcomeEmail,
};
