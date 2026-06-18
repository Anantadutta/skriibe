const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Fan = require('../models/Fan');
const Creator = require('../models/Creator');
const AdminAlert = require('../models/AdminAlert');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGO_URI);
};

// Helper function to hash password
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

// Helper function to verify password
const verifyPassword = (password, storedHash) => {
  const [salt, key] = storedHash.split(':');
  const hashedBuffer = crypto.scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, 'hex');
  const match = crypto.timingSafeEqual(hashedBuffer, keyBuffer);
  return match;
};

// Helper: Issue JWT for fan
const issueToken = (res, fan) => {
  let tokenRoles = ['fan'];
  if (fan.roles && fan.roles.length > 0) {
    tokenRoles = fan.roles;
  }
  if (!tokenRoles.includes('fan')) tokenRoles.push('fan');

  const token = jwt.sign(
    { fanId: fan._id, email: fan.email, roles: tokenRoles, activeRole: fan.activeRole || 'fan' },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );
  res.cookie('fan_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

// Fan Google Strategy
passport.use('google-fan', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'mock',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock',
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/fan-auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      await connectDB();
      const email = profile.emails[0].value;
      let fan = await Fan.findOne({ email });
      if (!fan) {
        fan = new Fan({
          email,
          name: profile.displayName || '',
          password: hashPassword(Math.random().toString(36).slice(-8)), // dummy password
          authProvider: 'google'
        });
        await fan.save();
        
        await AdminAlert.create({
          type: 'fan_signup',
          title: 'New fan/buyer signup',
          message: `Fan signed up via Google: ${email}`,
          referenceId: fan._id
        });
      }
      done(null, fan);
    } catch (err) {
      done(err, null);
    }
  }
));

// Fan Facebook Strategy
passport.use('facebook-fan', new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID || 'mock',
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || 'mock',
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/fan-auth/facebook/callback`,
    profileFields: ['id', 'emails', 'name']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      await connectDB();
      const email = profile.emails?.[0]?.value || `fb_${profile.id}@temp.skriibe.com`;
      let fan = await Fan.findOne({ email });
      if (!fan) {
        fan = new Fan({
          email,
          name: `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() || profile.displayName || '',
          password: hashPassword(Math.random().toString(36).slice(-8)),
          authProvider: 'facebook'
        });
        await fan.save();

        await AdminAlert.create({
          type: 'fan_signup',
          title: 'New fan/buyer signup',
          message: `Fan signed up via Facebook: ${email}`,
          referenceId: fan._id
        });
      }
      done(null, fan);
    } catch (err) {
      done(err, null);
    }
  }
));

// -- ROUTES --

// Middleware to verify fan JWT
const verifyFanToken = (req, res, next) => {
  const token = req.cookies.fan_token;
  if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });
  try {
    req.fan = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

router.get('/me', verifyFanToken, async (req, res) => {
  try {
    await connectDB();
    const fan = await Fan.findById(req.fan.fanId).select('-password');
    if (!fan) {
      return res.status(404).json({ success: false, message: 'Fan not found' });
    }
    res.json({ success: true, fan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/me', verifyFanToken, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    await connectDB();
    const existingFan = await Fan.findOne({ email: email.toLowerCase(), _id: { $ne: req.fan.fanId } });
    if (existingFan) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const fan = await Fan.findByIdAndUpdate(
      req.fan.fanId,
      { email: email.toLowerCase() },
      { new: true }
    ).select('-password');

    if (!fan) {
      return res.status(404).json({ success: false, message: 'Fan not found' });
    }

    issueToken(res, fan);

    res.json({ success: true, fan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/google', passport.authenticate('google-fan', { scope: ['profile', 'email'], prompt: 'select_account' }));
router.get('/google/callback', passport.authenticate('google-fan', { failureRedirect: '/fan/login' }), (req, res) => {
  issueToken(res, req.user);
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/explore`);
});

router.get('/facebook', passport.authenticate('facebook-fan', { scope: ['email', 'public_profile'] }));
router.get('/facebook/callback', passport.authenticate('facebook-fan', { failureRedirect: '/fan/login' }), (req, res) => {
  issueToken(res, req.user);
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/explore`);
});

router.post('/signup', async (req, res) => {
  try {
    await connectDB();
    const { name, email, password, whatsappPhone, whatsappConsent } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let normalizedPhone = '';
    let finalConsent = false;

    if (whatsappPhone) {
      normalizedPhone = whatsappPhone.replace(/[\+\s\-\(\)]/g, '');
      if (normalizedPhone.startsWith('0')) {
        normalizedPhone = normalizedPhone.substring(1);
      }
      if (normalizedPhone.length === 10) {
        normalizedPhone = '91' + normalizedPhone;
      }
      if (!/^\d{10,15}$/.test(normalizedPhone)) {
        return res.status(400).json({ message: 'Invalid WhatsApp number format. Please provide a valid number.' });
      }
      
      if (whatsappConsent) {
        finalConsent = true;
      }
    }

    const existingFan = await Fan.findOne({ email: email.toLowerCase() });
    if (existingFan) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = hashPassword(password);
    
    const newFan = new Fan({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      whatsappPhone: normalizedPhone,
      whatsappConsent: finalConsent
    });
    
    await newFan.save();

    await AdminAlert.create({
      type: 'fan_signup',
      title: 'New fan/buyer signup',
      message: `Fan signed up via Email: ${newFan.email}`,
      referenceId: newFan._id
    });
    
    issueToken(res, newFan);
    
    res.status(201).json({ success: true, fan: { id: newFan._id, name: newFan.name, email: newFan.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const fan = await Fan.findOne({ email: email.toLowerCase() });
    if (!fan) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }



    const isMatch = verifyPassword(password, fan.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    issueToken(res, fan);
    
    res.json({ success: true, fan: { id: fan._id, name: fan.name, email: fan.email, roles: fan.roles, activeRole: fan.activeRole } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    await connectDB();
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const fan = await Fan.findOne({ email: email.toLowerCase() });
    if (fan) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      fan.resetPasswordToken = resetToken;
      fan.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
      await fan.save();
      
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/fan/reset-password/${resetToken}`;
      const { sendPasswordResetEmail } = require('../utils/emailService');
      await sendPasswordResetEmail(fan.email, fan.name, resetLink);
    }

    res.json({ success: true, message: "If this email exists, you'll receive a link" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    await connectDB();
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and new password required' });

    if (password.length < 8 || !/[0-9\\W]/.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long and contain at least one number or special character.' });
    }

    const fan = await Fan.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!fan) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    fan.password = hashPassword(password);
    fan.resetPasswordToken = undefined;
    fan.resetPasswordExpires = undefined;
    await fan.save();

    res.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/logout', (req, res) => {
  res.clearCookie('fan_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.json({ success: true });
});

router.post('/me/upgrade-to-creator', verifyFanToken, async (req, res) => {
  try {
    const { creator_name, bio, category } = req.body;
    if (!creator_name || !bio || !category) {
      return res.status(400).json({ success: false, message: 'Creator name, bio, and category are required' });
    }

    await connectDB();
    const fan = await Fan.findById(req.fan.fanId);
    if (!fan) return res.status(404).json({ success: false, message: 'Fan not found' });

    if (!fan.roles.includes('creator')) {
      fan.roles.push('creator');
      fan.activeRole = 'creator';
      await fan.save();
    }

    const CreatorProfile = require('../models/CreatorProfile');
    let profile = await CreatorProfile.findOne({ user: fan._id });
    if (!profile) {
      profile = new CreatorProfile({
        user: fan._id,
        creator_name,
        bio,
        category
      });
      await profile.save();
    } else {
      profile.creator_name = creator_name;
      profile.bio = bio;
      profile.category = category;
      await profile.save();
    }

    let creator = await Creator.findOne({ email: fan.email.toLowerCase() });
    if (!creator) {
      let baseHandle = creator_name.toLowerCase().replace(/\s+/g, '');
      let uniqueHandle = baseHandle;
      let counter = 1;
      while (await Creator.findOne({ handle: uniqueHandle })) {
        uniqueHandle = baseHandle + counter;
        counter++;
      }

      creator = new Creator({
        email: fan.email.toLowerCase(),
        password: fan.password,
        name: creator_name,
        handle: uniqueHandle,
        bio: bio,
        expertise: [category],
        fanId: fan._id
      });
      await creator.save();
    } else {
      creator.fanId = fan._id;
      if (!creator.name) creator.name = creator_name;
      await creator.save();
    }

    // Issue updated token
    issueToken(res, fan);
    res.json({ success: true, message: 'Upgraded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error during upgrade: ' + err.message });
  }
});

router.post('/switch-role', verifyFanToken, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['fan', 'creator'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    await connectDB();
    const fan = await Fan.findById(req.fan.fanId);
    if (!fan) return res.status(404).json({ success: false, message: 'Fan not found' });

    if (!fan.roles.includes(role)) {
      return res.status(403).json({ success: false, message: 'Role not assigned to user' });
    }

    fan.activeRole = role;
    await fan.save();

    // Issue updated token
    issueToken(res, fan);
    res.json({ success: true, message: `Switched to ${role}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error switching role' });
  }
});

module.exports = router;
