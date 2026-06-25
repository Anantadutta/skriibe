const express = require('express');
const router = express.Router();
const EmailOtp = require('../models/EmailOtp');
const Fan = require('../models/Fan');
const Creator = require('../models/Creator');
const { sendEmailOtp } = require('../utils/brevoService');

// Helper to generate a 6 digit code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

router.post('/send-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required.' });
    }

    const emailLower = email.toLowerCase();
    const now = new Date();

    const testEmail = (process.env.TEST_REVIEWER_EMAIL || 'metareviewer@skriibe.com').toLowerCase();
    if (emailLower === testEmail) {
      return res.status(200).json({ success: true, message: 'Verification code sent.' });
    }

    let otpRecord = await EmailOtp.findOne({ email: emailLower });

    if (otpRecord) {
      // Check 30s cooldown
      if (otpRecord.lastSentAt && now.getTime() - otpRecord.lastSentAt.getTime() < 30 * 1000) {
        return res.status(429).json({ success: false, message: 'Please wait 30 seconds before requesting a new code.' });
      }

      // Check daily reset
      if (!otpRecord.dailyResetAt || now.getTime() > otpRecord.dailyResetAt.getTime()) {
        otpRecord.dailySends = 0;
        otpRecord.dailyResetAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      }

      // Check daily cap
      if (otpRecord.dailySends >= 10) {
        return res.status(429).json({ success: false, message: 'Daily limit reached. Try again tomorrow.' });
      }
    } else {
      otpRecord = new EmailOtp({
        email: emailLower,
        dailyResetAt: new Date(now.getTime() + 24 * 60 * 60 * 1000)
      });
    }

    const code = generateCode();
    otpRecord.code = code;
    otpRecord.codeExpiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
    otpRecord.attempts = 0;
    otpRecord.lastSentAt = now;
    otpRecord.dailySends += 1;

    await otpRecord.save();

    // Send email
    await sendEmailOtp(emailLower, code);

    return res.status(200).json({ success: true, message: 'Verification code sent.' });
  } catch (error) {
    console.error('Error in send-code:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required.' });
    }

    const emailLower = email.toLowerCase();
    
    const testEmail = (process.env.TEST_REVIEWER_EMAIL || 'metareviewer@skriibe.com').toLowerCase();
    const testOtp = process.env.TEST_REVIEWER_OTP || '123456';

    if (emailLower === testEmail) {
      if (code === testOtp) {
        await Fan.updateMany({ email: emailLower }, { $set: { isEmailVerified: true } });
        await Creator.updateMany({ email: emailLower }, { $set: { isEmailVerified: true } });
        return res.status(200).json({ success: true, message: 'Email verified successfully.' });
      } else {
        return res.status(400).json({ success: false, message: 'Invalid code. 5 attempts remaining.' });
      }
    }

    const otpRecord = await EmailOtp.findOne({ email: emailLower });

    if (!otpRecord || !otpRecord.code) {
      return res.status(400).json({ success: false, message: 'No verification code requested for this email.' });
    }

    const now = new Date();
    if (now.getTime() > otpRecord.codeExpiresAt.getTime()) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    if (otpRecord.attempts >= 5) {
      // Clear code so they have to request a new one
      otpRecord.code = null;
      await otpRecord.save();
      return res.status(400).json({ success: false, message: 'Too many failed attempts. Please request a new code.' });
    }

    if (otpRecord.code !== code) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const attemptsLeft = 5 - otpRecord.attempts;
      return res.status(400).json({ success: false, message: `Invalid code. ${attemptsLeft} attempts remaining.` });
    }

    // Success!
    otpRecord.code = null;
    otpRecord.codeExpiresAt = null;
    await otpRecord.save();

    // Update users in both collections
    await Fan.updateMany({ email: emailLower }, { $set: { isEmailVerified: true } });
    await Creator.updateMany({ email: emailLower }, { $set: { isEmailVerified: true } });

    return res.status(200).json({ success: true, message: 'Email verified successfully.' });
  } catch (error) {
    console.error('Error in verify-code:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;
