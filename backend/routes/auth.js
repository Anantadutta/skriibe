/**
 * @file auth.js
 * @description Authentication routes (OTP, Google, Meta, Instagram)
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const axios = require('axios');
const crypto = require('crypto');
const mongoose = require('mongoose');

const Creator = require('../models/Creator');
const OtpAttempt = require('../models/OtpAttempt');
const { sendOTPviaMSG91 } = require('../utils/smsService');

// Mock connectDB
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGO_URI);
};

// Passport Serialization
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'mock',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock',
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      await connectDB();
      const email = profile.emails[0].value;
      let creator = await Creator.findOne({ email });
      if (!creator) {
        creator = new Creator({
          email,
          name: profile.displayName || '',
          avatarUrl: profile.photos?.[0]?.value || ''
        });
        await creator.save();
      }
      done(null, creator);
    } catch (err) {
      done(err, null);
    }
  }
));

// Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID || 'mock',
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || 'mock',
    callbackURL: "/api/auth/facebook/callback",
    profileFields: ['id', 'emails', 'name', 'picture.type(large)']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      await connectDB();
      const email = profile.emails?.[0]?.value;
      if (!email) return done(new Error("No email found from Facebook"), null);
      let creator = await Creator.findOne({ email });
      if (!creator) {
        creator = new Creator({
          email,
          name: `${profile.name.givenName || ''} ${profile.name.familyName || ''}`.trim(),
          avatarUrl: profile.photos?.[0]?.value || ''
        });
        await creator.save();
      }
      done(null, creator);
    } catch (err) {
      done(err, null);
    }
  }
));

// Helper: Issue JWT
const issueToken = (res, creator) => {
  const token = jwt.sign(
    { creatorId: creator._id, email: creator.email },
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

// -- OTP ROUTES --

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// MSG91 call uses smsService now

let memOTPStore = new Map(); // Store OTPs in memory for short term, lockouts in DB

router.post('/send-otp', async (req, res) => {
  try {
    await connectDB();
    const { phone } = req.body;
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number.' });
    }

    const attempt = await OtpAttempt.findOne({ phone });
    if (attempt && attempt.lockedUntil && attempt.lockedUntil > new Date()) {
      const remaining = Math.ceil((attempt.lockedUntil - new Date()) / 60000);
      return res.status(429).json({ message: `Too many attempts. Try again in ${remaining} minutes.` });
    }

    const otp = generateOTP();
    memOTPStore.set(phone, { otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
    
    await sendOTPviaMSG91(phone, otp);
    res.json({ success: true, message: 'OTP sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    await connectDB();
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP required' });

    let attempt = await OtpAttempt.findOne({ phone });
    if (attempt && attempt.lockedUntil && attempt.lockedUntil > new Date()) {
      const remaining = Math.ceil((attempt.lockedUntil - new Date()) / 60000);
      return res.status(429).json({ message: `Locked. Try again in ${remaining} minutes.` });
    }

    const stored = memOTPStore.get(phone);
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP expired or not requested' });
    }

    if (stored.otp !== otp) {
      if (!attempt) attempt = new OtpAttempt({ phone });
      attempt.attempts += 1;
      if (attempt.attempts >= 3) {
        attempt.lockedUntil = new Date(Date.now() + 10 * 60 * 1000);
      }
      await attempt.save();

      if (attempt.attempts >= 3) {
        return res.status(429).json({ message: 'Too many attempts. Locked for 10 minutes.' });
      }
      return res.status(400).json({ message: `Incorrect OTP. ${3 - attempt.attempts} attempts remaining.` });
    }

    // Success
    memOTPStore.delete(phone);
    if (attempt) await OtpAttempt.deleteOne({ phone });

    let creator = await Creator.findOne({ phone });
    if (!creator) {
      // Create partial creator
      creator = new Creator({ phone, email: `${phone}@temp.skriibe.com` });
      await creator.save();
    }

    issueToken(res, creator);
    res.json({ success: true, creator });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// -- SOCIAL ROUTES --

router.post('/google-auth', async (req, res) => {
  try {
    await connectDB();
    const { access_token } = req.body;
    if (!access_token) return res.status(400).json({ message: 'Access token required' });

    // Fetch user profile from Google using the implicit access_token
    const googleRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    
    const profile = googleRes.data;
    if (!profile.email) return res.status(400).json({ message: 'No email returned from Google' });

    let creator = await Creator.findOne({ email: profile.email });
    if (!creator) {
      creator = new Creator({
        email: profile.email,
        name: profile.name || '',
        avatarUrl: profile.picture || ''
      });
      await creator.save();
    }

    issueToken(res, creator);
    res.json({ success: true, creator });
  } catch (err) {
    console.error('Google Auth Error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Google Authentication failed' });
  }
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/creator/signup' }), (req, res) => {
  issueToken(res, req.user);
  res.redirect('http://localhost:5173/creator/connect-instagram');
});

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/creator/signup' }), (req, res) => {
  issueToken(res, req.user);
  res.redirect('http://localhost:5173/creator/connect-instagram');
});

// -- INSTAGRAM ROUTES --

router.get('/instagram', (req, res) => {
  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:5000/api/auth/instagram/callback';
  const url = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code`;
  res.redirect(url);
});

router.get('/instagram/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.redirect('http://localhost:5173/creator/connect-instagram?error=nocode');

    // MOCK INSTAGRAM FETCH FOR NOW if no credentials provided
    let igData = {
      handle: 'mock_handle',
      name: 'Mock Creator',
      followers: 12500,
      bio: 'This is a mock bio from Instagram',
      accessToken: 'mock_access_token'
    };

    if (process.env.INSTAGRAM_CLIENT_ID) {
      const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:5000/api/auth/instagram/callback';
      const tokenRes = await axios.post('https://api.instagram.com/oauth/access_token', new URLSearchParams({
        client_id: process.env.INSTAGRAM_CLIENT_ID,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code
      }));
      const shortLivedToken = tokenRes.data.access_token;
      
      const userRes = await axios.get(`https://graph.instagram.com/me?fields=id,username,name,biography,profile_picture_url&access_token=${shortLivedToken}`);
      igData = {
        handle: userRes.data.username,
        name: userRes.data.name || '',
        bio: userRes.data.biography || '',
        avatarUrl: userRes.data.profile_picture_url || '',
        accessToken: shortLivedToken,
        followers: 0 // Instagram Basic API does not provide follower count, usually requires graph api
      };
    }

    // Encrypt token
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'), Buffer.alloc(16, 0));
    let encryptedToken = cipher.update(igData.accessToken, 'utf8', 'hex');
    encryptedToken += cipher.final('hex');

    // Pass data back to frontend via redirect with short-lived query params to be read by context
    // In a real app, you might save this directly to DB if you know who the user is, but here the user hasn't finished onboarding.
    // Wait, the prompt says "On successful connect: auto-fetch... Store instagramAccessToken (encrypted), instagramHandle, instagramFollowers, instagramConnected: true in DB".
    // We can do this if the user is authenticated. Let's get the user from JWT.
    
    const token = req.cookies.creator_token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      await connectDB();
      await Creator.findByIdAndUpdate(decoded.creatorId, {
        instagramConnected: true,
        instagramFollowers: igData.followers,
        instagramAccessToken: encryptedToken
      });
    }

    const dataString = encodeURIComponent(JSON.stringify({
      handle: igData.handle,
      name: igData.name,
      bio: igData.bio,
      avatarUrl: igData.avatarUrl
    }));
    res.redirect(`http://localhost:5173/creator/connect-instagram?igData=${dataString}`);

  } catch (err) {
    console.error(err);
    res.redirect('http://localhost:5173/creator/connect-instagram?error=failed');
  }
});

router.post('/check-handle', async (req, res) => {
  try {
    const { handle } = req.body;
    if (!handle) return res.status(400).json({ message: 'Handle required' });
    await connectDB();
    const existing = await Creator.findOne({ handle });
    res.json({ available: !existing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
