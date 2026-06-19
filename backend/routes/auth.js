/**
 * @file auth.js
 * @description Authentication routes (OTP, Google, Meta, Instagram)
 */

const express = require('express');
const { getCookieOptions, getClearCookieOptions } = require('../utils/cookieConfig');
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
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      await connectDB();
      const email = profile.emails[0].value;
      
      let stateObj = { role: 'creator', action: 'signup' };
      try {
        stateObj = JSON.parse(Buffer.from(req.query.state || '', 'base64').toString('utf8'));
      } catch (e) {
        if (req.query.state === 'fan' || req.query.state === 'creator') {
          stateObj.role = req.query.state;
        }
      }
      
      const isFan = stateObj.role === 'fan';
      const action = stateObj.action;

      if (isFan) {
        const Fan = require('../models/Fan');
        let fan = await Fan.findOne({ email });
        if (!fan) {
          if (action === 'login') {
            return done(null, false, { message: 'No account found. Please register first.' });
          }
          fan = new Fan({
            email,
            name: profile.displayName || '',
            password: 'oauth_dummy_pass',
            authProvider: 'google'
          });
          await fan.save();
        }
        fan.isFanLogin = true;
        return done(null, fan);
      } else {
        let creator = await Creator.findOne({ email });
        let isNewCreator = false;
        if (!creator) {
          if (action === 'login') {
            return done(null, false, { message: 'No account found. Please register first.' });
          }
          isNewCreator = true;
          creator = new Creator({
            email,
            name: profile.displayName || '',
            avatarUrl: profile.photos?.[0]?.value || '',
            authProvider: 'google'
          });
          await creator.save();

          const AdminAlert = require('../models/AdminAlert');
          await AdminAlert.create({
            type: 'creator_signup',
            title: 'New Creator Signup',
            message: `New creator registered via Google: ${email}`,
            referenceId: creator._id
          });
        }
        if (creator.isBanned || creator.blacklisted) {
          return done(null, false, { message: 'Account permanently removed.' });
        }
        creator.isNewCreator = isNewCreator;
        return done(null, creator);
      }
    } catch (err) {
      done(err, null);
    }
  }
));

// Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      await connectDB();
      const email = profile.emails?.[0]?.value || `fb_${profile.id}@temp.skriibe.com`;
      
      let stateObj = { role: 'creator', action: 'signup' };
      try {
        stateObj = JSON.parse(Buffer.from(req.query.state || '', 'base64').toString('utf8'));
      } catch (e) {
        if (req.query.state === 'fan' || req.query.state === 'creator') {
          stateObj.role = req.query.state;
        }
      }
      
      const isFan = stateObj.role === 'fan';
      const action = stateObj.action;

      if (isFan) {
        const Fan = require('../models/Fan');
        let fan = await Fan.findOne({ email });
        if (!fan) {
          if (action === 'login') {
            return done(null, false, { message: 'No account found. Please register first.' });
          }
          fan = new Fan({
            email,
            name: `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() || profile.displayName || '',
            password: 'oauth_dummy_pass',
            authProvider: 'facebook'
          });
          await fan.save();
        }
        fan.isFanLogin = true;
        return done(null, fan);
      } else {
        let creator = await Creator.findOne({ email });
        let isNewCreator = false;
        if (!creator) {
          if (action === 'login') {
            return done(null, false, { message: 'No account found. Please register first.' });
          }
          isNewCreator = true;
          creator = new Creator({
            email,
            name: `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() || profile.displayName || '',
            avatarUrl: profile.photos?.[0]?.value || '',
            authProvider: 'facebook'
          });
          await creator.save();

          const AdminAlert = require('../models/AdminAlert');
          await AdminAlert.create({
            type: 'creator_signup',
            title: 'New Creator Signup',
            message: `New creator registered via Facebook: ${email}`,
            referenceId: creator._id
          });
        }
        if (creator.isBanned || creator.blacklisted) {
          return done(null, false, { message: 'Account permanently removed.' });
        }
        creator.isNewCreator = isNewCreator;
        return done(null, creator);
      }
    } catch (err) {
      done(err, null);
    }
  }
));

const issueToken = (creator) => {
  return jwt.sign(
    { creatorId: creator._id, email: creator.email },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );
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
    let isNewCreator = false;
    if (!creator) {
      // Create partial creator
      creator = new Creator({ phone, email: `${phone}@temp.skriibe.com` });
      await creator.save();
      isNewCreator = true;

      const AdminAlert = require('../models/AdminAlert');
      await AdminAlert.create({
        type: 'creator_signup',
        title: 'New Creator Signup',
        message: `New creator registered via Phone: ${phone}`,
        referenceId: creator._id
      });
    }

    creator.isNewCreator = isNewCreator;

    if (creator.isBanned || creator.blacklisted) {
      return res.status(403).json({ message: 'Account permanently removed.' });
    }

    const token = issueToken(creator);
    res.json({ success: true, creator, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// -- SOCIAL ROUTES --
router.get('/google', (req, res, next) => {
  const role = req.query.role === 'fan' ? 'fan' : 'creator';
  const action = req.query.action === 'login' ? 'login' : 'signup';
  const state = Buffer.from(JSON.stringify({ role, action })).toString('base64');
  passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account', state })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      let role = 'creator';
      try {
        const stateObj = JSON.parse(Buffer.from(req.query.state || '', 'base64').toString('utf8'));
        role = stateObj.role || 'creator';
      } catch (e) {
        role = req.query.state === 'fan' ? 'fan' : 'creator';
      }
      const redirectBase = role === 'fan' ? '/fan/login' : '/creator/login';
      const msg = info && info.message ? info.message : 'Login failed';
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}${redirectBase}?error=${encodeURIComponent(msg)}`);
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      if (req.user.isFanLogin) {
    const token = jwt.sign(
      { fanId: req.user._id, email: req.user.email, roles: ['fan'], activeRole: 'fan' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/discovery#token=${token}`);
  } else {
    const token = issueToken(req.user);
    const hasCompletedOnboarding = !!req.user.handle;
    if (req.user.isNewCreator || !hasCompletedOnboarding) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/onboard/profile#token=${token}`);
    } else {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/creator/dashboard#token=${token}`);
    }
  }
    });
  })(req, res, next);
});

router.get('/facebook', (req, res, next) => {
  const role = req.query.role === 'fan' ? 'fan' : 'creator';
  const action = req.query.action === 'login' ? 'login' : 'signup';
  const state = Buffer.from(JSON.stringify({ role, action })).toString('base64');
  passport.authenticate('facebook', { scope: ['email', 'public_profile'], state })(req, res, next);
});

const oauthCodeCache = new Map();

router.get('/facebook/callback', async (req, res, next) => {
  const code = req.query.code;
  
  if (code && oauthCodeCache.has(code)) {
    console.log('Duplicate OAuth request detected. Waiting for first request to finish...');
    try {
      const token = await oauthCodeCache.get(code);
      if (token) {
        let role = 'creator';
        try {
          const stateObj = JSON.parse(Buffer.from(req.query.state || '', 'base64').toString('utf8'));
          role = stateObj.role || 'creator';
        } catch(e) {}
        
        if (role === 'fan') {
          return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/discovery#token=${token}`);
        } else {
          return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/creator/dashboard#token=${token}`);
        }
      }
    } catch (err) {
      console.log('First request failed, duplicate falling through.', err);
    }
  }

  let resolveToken, rejectToken;
  if (code) {
    const promise = new Promise((res, rej) => {
      resolveToken = res;
      rejectToken = rej;
    });
    oauthCodeCache.set(code, promise);
    setTimeout(() => {
      oauthCodeCache.delete(code);
      if (rejectToken) rejectToken(new Error('timeout'));
    }, 60000);
  }

  passport.authenticate('facebook', { session: false }, (err, user, info) => {
    if (err) {
      if (rejectToken) rejectToken(err);
      let msg = err.message || 'Authentication failed';
      if (msg.toLowerCase().includes('authorization code has been used') || msg.toLowerCase().includes('already been used')) {
        msg = 'Login timeout or double request. Please click Login with Meta again.';
      }
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/creator/login?error=${encodeURIComponent(msg)}`);
    }
    if (!user) {
      if (rejectToken) rejectToken(new Error('No user'));
      let role = 'creator';
      try {
        const stateObj = JSON.parse(Buffer.from(req.query.state || '', 'base64').toString('utf8'));
        role = stateObj.role || 'creator';
      } catch (e) {
        role = req.query.state === 'fan' ? 'fan' : 'creator';
      }
      const redirectBase = role === 'fan' ? '/fan/login' : '/creator/login';
      const msg = info && info.message ? info.message : 'Login failed';
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}${redirectBase}?error=${encodeURIComponent(msg)}`);
    }

    // Process authenticated user
    let generatedToken = null;
    if (user.isFanLogin) {
      generatedToken = jwt.sign(
        { fanId: user._id, email: user.email, roles: ['fan'], activeRole: 'fan' },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );
      if (resolveToken) resolveToken(generatedToken);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/explore#token=${generatedToken}`);
    } else {
      generatedToken = issueToken(user);
      if (resolveToken) resolveToken(generatedToken);
      const hasCompletedOnboarding = !!user.handle;
      if (user.isNewCreator || !hasCompletedOnboarding) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/onboard/profile#token=${generatedToken}`);
      } else {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/creator/dashboard#token=${generatedToken}`);
      }
    }
  })(req, res, next);
});

// -- INSTAGRAM ROUTES --

router.get('/instagram', (req, res) => {
  const clientId = process.env.INSTAGRAM_APP_ID;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:5000/api/auth/instagram/callback';
  const url = `https://www.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments&response_type=code`;
  res.redirect(url);
});

router.get('/instagram/callback', async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${frontendUrl}/creator/connect-instagram?instagram=error&reason=auth_failed`);
    }

    const clientId = process.env.INSTAGRAM_APP_ID;
    const clientSecret = process.env.INSTAGRAM_APP_SECRET;
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:5000/api/auth/instagram/callback';

    // Step 1 - Exchange code for short-lived access token
    const tokenRes = await axios.post('https://api.instagram.com/oauth/access_token', new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code
    }));
    const shortLivedToken = tokenRes.data.access_token;

    // Step 2 - Exchange for long-lived access token
    const longTokenRes = await axios.get(`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${clientSecret}&access_token=${shortLivedToken}`);
    const longLivedToken = longTokenRes.data.access_token;

    // Step 3 - Fetch Instagram profile
    const userRes = await axios.get(`https://graph.instagram.com/v19.0/me?fields=id,username,name,profile_picture_url,followers_count&access_token=${longLivedToken}`);
    
    const { username, name, profile_picture_url, followers_count } = userRes.data;

    // Encrypt token
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'), Buffer.alloc(16, 0));
    let encryptedToken = cipher.update(longLivedToken, 'utf8', 'hex');
    encryptedToken += cipher.final('hex');

    // Step 4 - Update DB if user is logged in
    const token = req.query.state || req.cookies?.creator_token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      await connectDB();
      await Creator.findByIdAndUpdate(decoded.creatorId, {
        instagramConnected: true,
        instagramHandle: username,
        instagramFollowers: followers_count || 0,
        instagramAccessToken: encryptedToken
      });
    }

    // Redirect to frontend
    let redirectUrl = `${frontendUrl}/creator/connect-instagram?instagram=success&username=${username}`;
    if (followers_count !== undefined) {
      redirectUrl += `&followers=${followers_count}`;
    }
    if (profile_picture_url) {
      redirectUrl += `&pic=${encodeURIComponent(profile_picture_url)}`;
    }
    
    res.redirect(redirectUrl);

  } catch (err) {
    console.error('Instagram auth error:', err.response?.data || err.message);
    res.redirect(`${frontendUrl}/creator/connect-instagram?instagram=error&reason=fetch_failed`);
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
