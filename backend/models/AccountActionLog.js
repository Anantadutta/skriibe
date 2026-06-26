const mongoose = require('mongoose');

const AccountActionLogSchema = new mongoose.Schema({
  userType: { type: String, enum: ['creator', 'fan'], required: true },
  action: { type: String, enum: ['delete', 'pause'], required: true },
  reason: { type: String, required: true },
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.AccountActionLog || mongoose.model('AccountActionLog', AccountActionLogSchema);
