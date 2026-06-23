/**
 * @file Fan.js
 * @description Mongoose model for Skriibe Fans (users).
 */

const mongoose = require('mongoose');

const FanSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  isEmailVerified: { type: Boolean, default: false },
  password: { type: String, required: true },
  name: { type: String, default: '' },
  roles: { type: [String], enum: ['fan', 'creator'], default: ['fan'] },
  activeRole: { type: String, enum: ['fan', 'creator'], default: 'fan' },
  avatarUrl: { type: String, default: null },
  isBanned: { type: Boolean, default: false },
  banExpiresAt: { type: Date, default: null },
  authProvider: { type: String, default: 'local' },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  whatsappPhone: { type: String, default: '' },
  phone: { type: String, default: '' },
  whatsappConsent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Fan || mongoose.model('Fan', FanSchema);
