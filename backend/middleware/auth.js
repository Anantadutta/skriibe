const jwt = require('jsonwebtoken');

const verifyCreatorToken = (req, res, next) => {
  const token = req.cookies?.creator_token;
  if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });
  try {
    req.creator = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch { 
    res.clearCookie('creator_token');
    return res.status(401).json({ success: false, message: 'Invalid token' }); 
  }
};

const verifyAdminToken = (req, res, next) => {
  const token = req.cookies?.admin_token;
  if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });
    req.admin = decoded;
    next();
  } catch { return res.status(401).json({ success: false, message: 'Invalid token' }); }
};

module.exports = { verifyCreatorToken, verifyAdminToken };
