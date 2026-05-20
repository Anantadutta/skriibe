/**
 * @file creator.js
 * @description Routes for creator profile setup and activation.
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Creator = require('../models/Creator');
const { sendWelcomeEmail, sendProfileSubmittedEmail } = require('../utils/emailService');

// Middleware to verify creator JWT
const verifyCreatorToken = (req, res, next) => {
  const token = req.cookies.creator_token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.creator = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGO_URI);
};

// Issue JWT helper
const issueToken = (res, creator) => {
  const token = jwt.sign(
    { creatorId: creator._id, email: creator.email, handle: creator.handle },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );
  res.cookie('creator_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

/**
 * @route POST /api/creator/profile
 * @desc Save Step 1 profile data, trigger Resend welcome email
 */
router.post('/profile', verifyCreatorToken, async (req, res) => {
  try {
    const { name, handle, email, bio, expertise, avatarUrl, instagramHandle, instagramConnected, instagramFollowers } = req.body;

    if (!name || !handle || !email) {
      return res.status(400).json({ message: 'Name, handle, and email are required.' });
    }

    await connectDB();
    
    // Check if handle is taken by someone else
    const existing = await Creator.findOne({ handle, _id: { $ne: req.creator.creatorId } });
    if (existing) {
      return res.status(400).json({ message: 'Handle is already taken.' });
    }

    // Check if email is taken by someone else
    const existingEmail = await Creator.findOne({ email, _id: { $ne: req.creator.creatorId } });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email is already in use.' });
    }

    const updateFields = { name, handle, email, bio, expertise, avatarUrl };
    if (instagramHandle !== undefined) updateFields.instagramHandle = instagramHandle;
    if (instagramConnected !== undefined) updateFields.instagramConnected = instagramConnected;
    if (instagramFollowers !== undefined) updateFields.instagramFollowers = instagramFollowers;

    const updatedCreator = await Creator.findByIdAndUpdate(
      req.creator.creatorId,
      updateFields,
      { new: true }
    );

    sendProfileSubmittedEmail(updatedCreator.email, updatedCreator.name).catch(e => console.error("Failed to send profile email", e));

    // Send Welcome Email
    sendWelcomeEmail(updatedCreator.email, updatedCreator.name, updatedCreator.handle).catch(e => console.error("Failed to send welcome email", e));

    res.json({ success: true, creator: updatedCreator });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/creator/activate
 * @desc Save Step 2 pricing data, set ama_enabled to true, and issue final JWT
 */
router.post('/activate', verifyCreatorToken, async (req, res) => {
  try {
    const { price, dailyCap } = req.body;

    if (typeof price !== 'number' || price < 10) {
      return res.status(400).json({ message: 'Invalid price. Must be at least 10.' });
    }
    
    const cap = dailyCap || 50;
    if (typeof cap !== 'number' || cap < 5 || cap > 100) {
      return res.status(400).json({ message: 'Invalid daily cap. Must be between 5 and 100.' });
    }

    await connectDB();
    const updatedCreator = await Creator.findByIdAndUpdate(
      req.creator.creatorId,
      { price, dailyCap: cap, ama_enabled: true },
      { new: true }
    );

    // Re-issue JWT with full profile context (now it includes handle)
    issueToken(res, updatedCreator);

    res.json({ success: true, creator: updatedCreator, pageUrl: `/@${updatedCreator.handle}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/creator/me
 * @desc Get current creator
 */
router.get('/me', verifyCreatorToken, async (req, res) => {
  try {
    await connectDB();
    const creator = await Creator.findById(req.creator.creatorId);
    if (!creator) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, creator });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/creator/logout
 * @desc Logout creator
 */
router.post('/logout', (req, res) => {
  res.clearCookie('creator_token');
  res.json({ success: true });
});

module.exports = router;
