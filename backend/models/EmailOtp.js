/**
 * @file EmailOtp.js
 * @description Mongoose model for Email OTP Verification
 */

const mongoose = require('mongoose');

const EmailOtpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  code: { type: String },
  codeExpiresAt: { type: Date },
  attempts: { type: Number, default: 0 },
  lastSentAt: { type: Date },
  dailySends: { type: Number, default: 0 },
  dailyResetAt: { type: Date }
});

module.exports = mongoose.models.EmailOtp || mongoose.model('EmailOtp', EmailOtpSchema);
