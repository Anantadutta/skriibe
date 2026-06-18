const jwt = require('jsonwebtoken');
const { getClearCookieOptions } = require('../utils/cookieConfig');

const verifyCreatorToken = (req, res, next) => {
  let token = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    token = req.cookies?.creator_token;
  }

  if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });
  try {
    req.creator = jwt.verify(token, process.env.JWT_SECRET || 'secret');
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

const verifyFanToken = (req, res, next) => {
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
    const roles = decoded.roles || (decoded.role ? [decoded.role] : ['fan']);
    if (!roles.includes('fan')) return res.status(403).json({ success: false, message: 'Forbidden. Only fans can access this.' });
    decoded.roles = roles;
    req.fan = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = { verifyCreatorToken, verifyAdminToken, verifyFanToken };
