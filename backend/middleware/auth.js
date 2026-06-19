const jwt = require('jsonwebtoken');
const { getClearCookieOptions } = require('../utils/cookieConfig');

const verifyCreatorToken = async (req, res, next) => {
  let token = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    token = req.cookies?.creator_token;
  }

  if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    if (!decoded.creatorId && decoded.email) {
      const Creator = require('../models/Creator');
      const creator = await Creator.findOne({ email: decoded.email.toLowerCase() });
      if (creator) {
        decoded.creatorId = creator._id;
      }
    }
    
    req.creator = decoded;
    next();
  } catch { 
    res.clearCookie('creator_token', getClearCookieOptions());
    return res.status(401).json({ success: false, message: 'Invalid token' }); 
  }
};

const verifyAdminToken = (req, res, next) => {
  let token = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    token = req.cookies?.admin_token;
  }

  if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (decoded.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });
    req.admin = decoded;
    next();
  } catch { return res.status(401).json({ success: false, message: 'Invalid token' }); }
};

const verifyFanToken = async (req, res, next) => {
  let token = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    token = req.cookies?.fan_token;
  }

  if (!token) return res.status(401).json({ success: false, message: 'Not authenticated. Please login as a Fan.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    if (!decoded.fanId && (decoded.email || decoded.creatorId)) {
      const Fan = require('../models/Fan');
      const Creator = require('../models/Creator');
      
      let creator = null;
      if (decoded.creatorId) {
        creator = await Creator.findById(decoded.creatorId);
      } else if (decoded.email) {
        creator = await Creator.findOne({ email: decoded.email.toLowerCase() });
      }

      const creatorEmail = creator && creator.email ? creator.email.toLowerCase() : (creator && creator.phone ? `${creator.phone}@temp.skriibe.com` : null);

      let fan = null;
      if (creator && creator.fanId) {
        fan = await Fan.findById(creator.fanId);
      } else if (creatorEmail) {
        fan = await Fan.findOne({ email: creatorEmail });
      } else if (decoded.email) {
        fan = await Fan.findOne({ email: decoded.email.toLowerCase() });
      }

      if (!fan && creator && creatorEmail) {
        fan = new Fan({
          email: creatorEmail,
          password: 'auto-generated',
          name: creator.name || 'User',
          roles: ['fan', 'creator'],
          activeRole: 'fan',
          authProvider: creator.authProvider || 'local'
        });
        await fan.save();
        creator.fanId = fan._id;
        if (!creator.email) creator.email = creatorEmail;
        await creator.save();
      }

      if (fan) {
        decoded.fanId = fan._id;
        if (!decoded.roles) decoded.roles = fan.roles;
      }
    }
    
    const roles = decoded.roles || (decoded.role ? [decoded.role] : ['fan']);
    if (!roles.includes('fan')) roles.push('fan');
    decoded.roles = roles;
    req.fan = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = { verifyCreatorToken, verifyAdminToken, verifyFanToken };
