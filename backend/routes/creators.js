/**
 * @file creators.js
 * @description Routes for creator onboarding, authentication, and profile management.
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const Creator = require('../models/Creator');
const otpStore = require('../utils/otpStore');
const { verifyCreatorToken } = require('../middleware/auth');
const { sendWelcomeEmail } = require('../utils/emailService');

// Multer setup for avatar uploads (in-memory for now or local uploads folder)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .jpeg format allowed!'), false);
    }
  }
});

// Rate limiter for OTP
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per windowMs
  message: { message: 'Too many requests. Try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Mock connectDB for the routes (as pattern in server.js)
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGO_URI);
};

/**
 * @route POST /api/creators/send-otp
 * @desc Send OTP to creator phone number
 */
router.post('/send-otp', otpLimiter, async (req, res) => {
  const { phone } = req.body;
  
  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ message: 'Invalid phone number. Must be 10 digits starting with 6-9.' });
  }

  const existingOTP = otpStore.getOTP(phone);
  if (existingOTP && existingOTP.lockedUntil && existingOTP.lockedUntil > new Date()) {
    return res.status(429).json({ message: 'Too many attempts. Try again in 30 minutes.' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.saveOTP(phone, otp);

  console.log('----------------------------');
  console.log(`OTP for ${phone} : ${otp}`);
  console.log('----------------------------');

  res.json({ success: true, message: 'OTP sent successfully' });
});

/**
 * @route POST /api/creators/verify-otp
 * @desc Verify OTP and issue JWT
 */
router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ message: 'Phone and OTP are required.' });
  }

  const stored = otpStore.getOTP(phone);

  if (!stored) {
    return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
  }

  if (stored.lockedUntil && stored.lockedUntil > new Date()) {
    return res.status(429).json({ message: 'Too many attempts. Try again in 30 minutes.' });
  }

  if (stored.expiresAt < new Date()) {
    otpStore.clearOTP(phone);
    return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
  }

  if (stored.otp !== otp) {
    otpStore.incrementAttempts(phone);
    const updated = otpStore.getOTP(phone);
    if (updated.attempts >= 3) {
      otpStore.lockPhone(phone);
      return res.status(429).json({ message: 'Too many attempts. Try again in 30 minutes.' });
    }
    return res.status(400).json({ message: `Incorrect OTP. ${3 - updated.attempts} attempts remaining.` });
  }

  // Success
  otpStore.clearOTP(phone);
  await connectDB();

  let creator = await Creator.findOneAndUpdate(
    { phone },
    { phone },
    { upsert: true, new: true }
  );

  const token = jwt.sign(
    { creatorId: creator._id, phone: creator.phone },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('creator_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  const onboardingComplete = !!(creator.name && creator.handle && creator.ama_enabled);

  res.json({
    success: true,
    creator: {
      id: creator._id,
      phone: creator.phone,
      name: creator.name,
      handle: creator.handle,
      onboardingComplete
    }
  });
});

/**
 * @route GET /api/creators/me
 * @desc Get current creator data
 */
router.get('/me', verifyCreatorToken, async (req, res) => {
  try {
    await connectDB();
    const creator = await Creator.findById(req.creator.creatorId);
    if (!creator) return res.status(404).json({ message: 'Creator not found' });
    
    res.json({ success: true, creator });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/creators/check-handle
 * @desc Check if handle is available
 */
router.post('/check-handle', async (req, res) => {
  const { handle } = req.body;
  if (!handle || handle.length < 3 || handle.length > 30 || !/^[a-z0-9_]+$/.test(handle)) {
    return res.json({ available: false });
  }

  await connectDB();
  const exists = await Creator.findOne({ handle });
  res.json({ available: !exists });
});

/**
 * @route POST /api/creators/onboarding/profile
 * @desc Save profile data
 */
router.post('/onboarding/profile', verifyCreatorToken, async (req, res) => {
  const { name, handle, email, bio, expertise, instagramHandle } = req.body;

  // Validation
  if (!name || name.length < 2 || name.length > 60) return res.status(400).json({ message: 'Invalid name' });
  if (!handle || !/^[a-z0-9_]{3,30}$/.test(handle)) return res.status(400).json({ message: 'Invalid handle' });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Invalid email address' });
  if (bio && bio.length > 200) return res.status(400).json({ message: 'Bio too long' });
  if (!Array.isArray(expertise) || expertise.length === 0) return res.status(400).json({ message: 'Expertise required' });

  await connectDB();
  
  // Check handle uniqueness excluding current creator
  const existingHandle = await Creator.findOne({ handle, _id: { $ne: req.creator.creatorId } });
  if (existingHandle) return res.status(400).json({ message: 'Handle already taken' });

  // Check email uniqueness excluding current creator
  const existingEmail = await Creator.findOne({ email, _id: { $ne: req.creator.creatorId } });
  if (existingEmail) return res.status(400).json({ message: 'Email already in use' });

  const updatedCreator = await Creator.findByIdAndUpdate(
    req.creator.creatorId,
    { name, handle, email, bio, expertise, instagramHandle },
    { new: true }
  );

  // Send Welcome Email asynchronously (don't block the response)
  sendWelcomeEmail(email, name, handle).catch(err => {
    console.error('Failed to send onboarding welcome email:', err);
  });

  res.json({ success: true, creator: updatedCreator });
});

/**
 * @route POST /api/creators/onboarding/pricing
 * @desc Save pricing data and enable AMA
 */
router.post('/onboarding/pricing', verifyCreatorToken, async (req, res) => {
  const { price, dailyCap } = req.body;

  if (typeof price !== 'number' || price < 10 || price > 9999) return res.status(400).json({ message: 'Invalid price' });
  if (typeof dailyCap !== 'number' || dailyCap < 5 || dailyCap > 100) return res.status(400).json({ message: 'Invalid daily cap' });

  await connectDB();
  const updatedCreator = await Creator.findByIdAndUpdate(
    req.creator.creatorId,
    { price, dailyCap, ama_enabled: true },
    { new: true }
  );

  res.json({ 
    success: true, 
    creator: updatedCreator, 
    pageUrl: '/@' + updatedCreator.handle 
  });
});

/**
 * @route POST /api/creators/logout
 * @desc Logout creator
 */
router.post('/logout', (req, res) => {
  res.clearCookie('creator_token');
  res.json({ success: true });
});

// Instagram OAuth routes
router.get('/connect-instagram', (req, res) => {
  const redirectUri = `${process.env.INSTAGRAM_REDIRECT_URI}`;
  const url = `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user_profile&response_type=code`;
  res.json({ url });
});

module.exports = router;
