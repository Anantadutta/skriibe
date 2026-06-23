/**
 * @file creators.js
 * @description Routes for creator onboarding, authentication, and profile management.
 */

const express = require('express');
const { getCookieOptions, getClearCookieOptions } = require('../utils/cookieConfig');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const Creator = require('../models/Creator');
const AdminAlert = require('../models/AdminAlert');
const otpStore = require('../utils/otpStore');
const { verifyCreatorToken } = require('../middleware/auth');
const { sendWelcomeEmail, sendProfileSubmittedEmail, sendPasswordResetEmail } = require('../utils/emailService');
const crypto = require('crypto');

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
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
      cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg, .jpeg, and .webp formats allowed!'), false);
    }
  }
});

// Route to upload avatar
router.post('/avatar', verifyCreatorToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const avatarUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
    
    await connectDB();
    const updatedCreator = await Creator.findByIdAndUpdate(
      req.creator.creatorId,
      { avatarUrl },
      { new: true }
    );
    
    res.json({ success: true, avatarUrl: updatedCreator.avatarUrl });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ message: 'Failed to upload avatar' });
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
  
  if (!phone || !/^\+[1-9]\d{6,14}$/.test(phone)) {
    return res.status(400).json({ message: 'Invalid phone number format.' });
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

  let creator = await Creator.findOne({ phone });
  let isNew = false;
  if (!creator) {
    creator = await Creator.create({ phone });
    isNew = true;
    
    // Create Admin Alert for Signup
    await AdminAlert.create({
      type: 'creator_signup',
      title: 'New creator signup',
      message: `Creator signed up via Phone: ${phone}`,
      referenceId: creator._id
    });
  } else {
    // Create Admin Alert for Login
    await AdminAlert.create({
      type: 'creator_signup', // reusing type for now to show up in alerts
      title: 'Creator login',
      message: `Creator logged in via Phone: ${phone}`,
      referenceId: creator._id
    });
  }

  const token = jwt.sign(
    { creatorId: creator._id, phone: creator.phone },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );

  const onboardingComplete = !!creator.handle;

  res.json({
    success: true,
    creator: {
      id: creator._id,
      phone: creator.phone,
      name: creator.name,
      handle: creator.handle,
      onboardingComplete
    },
    token
  });
});

/**
 * @route POST /api/creators/email-signup
 * @desc Signup via email and password
 */
router.post('/email-signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  await connectDB();

  let creator = await Creator.findOne({ email });

  if (creator) {
    return res.status(400).json({ message: 'Email is already registered. Please login.' });
  }

  creator = await Creator.create({ email, password });

  // Create Admin Alert
  await AdminAlert.create({
    type: 'creator_signup',
    title: 'New creator signup',
    message: `Creator signed up via Email: ${email}`,
    referenceId: creator._id
  });

  const token = jwt.sign(
    { creatorId: creator._id, email: creator.email },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    creator: {
      id: creator._id,
      email: creator.email,
      name: creator.name,
      handle: creator.handle,
      onboardingComplete: false
    },
    token
  });
});

/**
 * @route POST /api/creators/email-login
 * @desc Login via email and password
 */
router.post('/email-login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  await connectDB();

  let creator = await Creator.findOne({ email });

  if (!creator) {
    return res.status(400).json({ message: 'No account found with this email.' });
  }



  if (creator.password !== password) {
    return res.status(400).json({ message: 'Invalid credentials.' });
  }

  const token = jwt.sign(
    { creatorId: creator._id, email: creator.email },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );

  const onboardingComplete = !!creator.handle;

  res.json({
    success: true,
    creator: {
      id: creator._id,
      email: creator.email,
      name: creator.name,
      handle: creator.handle,
      onboardingComplete
    },
    token
  });
});

/**
 * @route POST /api/creators/forgot-password
 * @desc Request a password reset link
 */
router.post('/forgot-password', async (req, res) => {
  try {
    await connectDB();
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const creator = await Creator.findOne({ email: email.toLowerCase() });
    if (creator) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      creator.resetPasswordToken = resetToken;
      creator.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
      await creator.save();
      
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/creator/reset-password/${resetToken}`;
      await sendPasswordResetEmail(creator.email, creator.name, resetLink);
    }

    res.json({ success: true, message: "If this email exists, you'll receive a link" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/creators/reset-password
 * @desc Reset the creator's password
 */
router.post('/reset-password', async (req, res) => {
  try {
    await connectDB();
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and new password required' });

    if (password.length < 8 || !/[0-9\\W]/.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long and contain at least one number or special character.' });
    }

    const creator = await Creator.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!creator) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    creator.password = password; // Creator's currently save raw passwords
    creator.resetPasswordToken = undefined;
    creator.resetPasswordExpires = undefined;
    await creator.save();

    res.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/creators/me
 * @desc Get current creator data
 */
router.get('/me', verifyCreatorToken, async (req, res) => {
  try {
    await connectDB();
    const creator = await Creator.findById(req.creator.creatorId);
    if (!creator) {
      return res.status(401).json({ message: 'Session expired or user deleted' });
    }
    if (creator.isBanned) return res.status(403).json({ message: 'Account permanently removed' });
    
    // Removed mock data auto-seeding here so new users can enter their own details
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
  if (!handle || handle.length < 3 || handle.length > 30 || !/^[a-zA-Z0-9_.]+$/.test(handle)) {
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
  const { name, handle, email, phone, bio, expertise, instagramHandle, instagramFollowers } = req.body;

  // Validation
  if (!name || name.length < 2 || name.length > 60) return res.status(400).json({ message: 'Invalid name' });
  if (!handle || !/^[a-zA-Z0-9_.]{3,30}$/.test(handle)) return res.status(400).json({ message: 'Invalid handle' });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Invalid email address' });
  if (!phone || !/^\+[1-9]\d{6,14}$/.test(phone)) return res.status(400).json({ message: 'Invalid phone number' });
  if (bio && bio.length > 200) return res.status(400).json({ message: 'Bio too long' });
  if (!Array.isArray(expertise) || expertise.length === 0 || expertise.length > 2) return res.status(400).json({ message: '1 to 2 expertise fields required' });

  await connectDB();
  
  // Check handle uniqueness excluding current creator
  const existingHandle = await Creator.findOne({ handle, _id: { $ne: req.creator.creatorId } });
  if (existingHandle) return res.status(400).json({ message: 'Handle already taken' });

  // Check email uniqueness excluding current creator
  const existingEmail = await Creator.findOne({ email, _id: { $ne: req.creator.creatorId } });
  if (existingEmail) return res.status(400).json({ message: 'Email already in use' });

  // Check phone uniqueness excluding current creator
  const existingPhone = await Creator.findOne({ phone, _id: { $ne: req.creator.creatorId } });
  if (existingPhone) return res.status(400).json({ message: 'Phone number already in use' });

  const updatedCreator = await Creator.findByIdAndUpdate(
    req.creator.creatorId,
    { name, handle, profileUrl: `skriibe.com/${handle}`, email, phone, bio, expertise, instagramHandle, instagramFollowers },
    { new: true }
  );

  if (!updatedCreator) {
    res.clearCookie('creator_token', getClearCookieOptions());
    return res.status(401).json({ message: 'Session expired or user deleted. Please log in again.' });
  }

  // Send Welcome Emails asynchronously (don't block the response)
  res.json({ success: true, creator: updatedCreator });
});

/**
 * @route POST /api/creators/onboarding/pricing
 * @desc Save pricing data and enable AMA
 */
router.post('/onboarding/pricing', verifyCreatorToken, async (req, res) => {
  const { price, dailyCap, weeklyGoal } = req.body;

  if (typeof price !== 'number' || price < 10 || price > 9999) return res.status(400).json({ message: 'Invalid price' });
  if (typeof dailyCap !== 'number' || dailyCap < 5 || dailyCap > 100) return res.status(400).json({ message: 'Invalid daily cap' });

  const updateData = { price, pricePerQuestion: price, dailyCap, ama_enabled: true, isLive: true };
  if (typeof weeklyGoal === 'number') updateData.weeklyGoal = weeklyGoal;

  await connectDB();
  const updatedCreator = await Creator.findByIdAndUpdate(
    req.creator.creatorId,
    updateData,
    { new: true }
  );

  if (!updatedCreator) {
    res.clearCookie('creator_token', getClearCookieOptions());
    return res.status(401).json({ message: 'Session expired or user deleted. Please log in again.' });
  }

  sendWelcomeEmail(updatedCreator.email, updatedCreator.name, updatedCreator.handle).catch(err => {
    console.error('Failed to send onboarding welcome email:', err);
  });

  res.json({ 
    success: true, 
    creator: updatedCreator, 
    pageUrl: '/@' + updatedCreator.handle 
  });
});

/**
 * @route POST /api/creators/link-bank
 * @desc Link bank account
 */
router.post('/link-bank', verifyCreatorToken, async (req, res) => {
  const { pan, accountName, accountNumber, ifsc, phone } = req.body || {};
  await connectDB();
  const updateData = { bankLinked: true };
  if (pan) updateData.pan = pan;
  if (accountName) updateData.bankAccountName = accountName;
  if (accountNumber) updateData.bankAccountNumber = accountNumber;
  if (ifsc) updateData.bankIfsc = ifsc;
  if (phone) updateData.phone = phone;

  const updatedCreator = await Creator.findByIdAndUpdate(
    req.creator.creatorId,
    updateData,
    { new: true }
  );

  if (!updatedCreator) {
    res.clearCookie('creator_token', getClearCookieOptions());
    return res.status(401).json({ message: 'Session expired or user deleted. Please log in again.' });
  }

  res.json({ success: true, creator: updatedCreator });
});

/**
 * @route POST /api/creators/toggle-live
 * @desc Toggle creator live status
 */
router.post('/toggle-live', verifyCreatorToken, async (req, res) => {
  const { isLive } = req.body;
  if (typeof isLive !== 'boolean') return res.status(400).json({ message: 'Invalid status' });

  try {
    await connectDB();
    const currentCreator = await Creator.findById(req.creator.creatorId);
    if (!currentCreator) return res.status(404).json({ message: 'Not found' });
    if (isLive && currentCreator.suspensionUntil && new Date() < new Date(currentCreator.suspensionUntil)) {
      return res.status(403).json({ message: 'Account is currently suspended. You cannot go live.' });
    }

    const updatedCreator = await Creator.findByIdAndUpdate(
      req.creator.creatorId,
      { isLive },
      { new: true }
    );

    if (!updatedCreator) {
      res.clearCookie('creator_token', getClearCookieOptions());
      return res.status(401).json({ message: 'Session expired or user deleted. Please log in again.' });
    }

    req.io.emit('creator-status-changed', { creatorId: updatedCreator._id.toString(), isLive });
    res.json({ success: true, creator: updatedCreator });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/creators/logout
 * @desc Logout creator
 */
router.post('/logout', (req, res) => {
  res.json({ success: true });
});

/**
 * @route POST /api/creators/settings
 * @desc Update general settings
 */
router.post('/settings', verifyCreatorToken, async (req, res) => {
  const { weeklyGoal, pricePerQuestion, dailyCap, autoPause, isPaused, bio, phone, instagramHandle, expertise, email } = req.body;
  const updateData = {};
  if (typeof weeklyGoal === 'number') updateData.weeklyGoal = weeklyGoal;
  if (typeof pricePerQuestion === 'number') {
    updateData.pricePerQuestion = pricePerQuestion;
    updateData.price = pricePerQuestion;
  }
  if (typeof dailyCap === 'number') updateData.dailyCap = dailyCap;
  if (typeof autoPause === 'boolean') updateData.autoPause = autoPause;
  if (typeof isPaused === 'boolean') updateData.isPaused = isPaused;
  if (typeof bio === 'string') updateData.bio = bio;
  if (typeof phone === 'string') updateData.phone = phone;
  if (typeof instagramHandle === 'string') updateData.instagramHandle = instagramHandle;
  if (typeof email === 'string') updateData.email = email;
  if (Array.isArray(expertise)) updateData.expertise = expertise;
  await connectDB();
  const updatedCreator = await Creator.findByIdAndUpdate(
    req.creator.creatorId,
    updateData,
    { new: true }
  );
  
  if (!updatedCreator) {
    res.clearCookie('creator_token', getClearCookieOptions());
    return res.status(401).json({ message: 'Session expired or user deleted. Please log in again.' });
  }

  res.json({ success: true, creator: updatedCreator });
});

router.get('/connect-instagram', verifyCreatorToken, (req, res) => {
  const redirectUri = `${process.env.INSTAGRAM_REDIRECT_URI}`;
  const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : '';
  const url = `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user_profile&response_type=code&state=${token}`;
  res.json({ url });
});

module.exports = router;
