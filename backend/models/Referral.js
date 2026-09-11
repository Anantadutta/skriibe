const mongoose = require('mongoose');

const ReferralSchema = new mongoose.Schema({
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
  referredCreatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
  name: { type: String, default: '' },
  handle: { type: String, default: '' },
  profilePic: { type: String, default: '' },
  email: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Deleted'], default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Referral || mongoose.model('Referral', ReferralSchema);
