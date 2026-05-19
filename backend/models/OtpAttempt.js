/**
 * @file OtpAttempt.js
 * @description Mongoose model to track OTP attempts and lockouts across instances.
 */

const mongoose = require('mongoose');

const OtpAttemptSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  attempts: { type: Number, default: 0 },
  lockedUntil: { type: Date, default: null },
  createdAt: { type: Date, expires: '1h', default: Date.now } // TTL index auto-cleans
});

module.exports = mongoose.model('OtpAttempt', OtpAttemptSchema);
