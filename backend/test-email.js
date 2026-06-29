require('dotenv').config();
const mongoose = require('mongoose');
const { Resend } = require('resend');
const Fan = require('./models/Fan');
const Creator = require('./models/Creator');
const { sendPasswordResetEmail } = require('./utils/emailService');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');
  
  const email = 'duttananta@gmail.com';
  
  const fan = await Fan.findOne({ email: email.toLowerCase() });
  console.log('Fan found:', !!fan);
  
  const creator = await Creator.findOne({ email: email.toLowerCase() });
  console.log('Creator found:', !!creator);

  // Try sending an email to see if Resend is configured correctly
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log('Sending test email via Resend...');
    const { data, error } = await resend.emails.send({
      from: 'skriibe <founder@skriibe.com>',
      to: [email],
      subject: 'Test email from backend',
      html: '<p>This is a test email</p>'
    });
    console.log('Resend response:', { data, error });
  } catch (err) {
    console.error('Error sending test email:', err);
  }
  
  process.exit(0);
}

test();
