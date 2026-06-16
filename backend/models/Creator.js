/**
 * @file Creator.js
 * @description Mongoose model for Skriibe Creators.
 */

const mongoose = require('mongoose');

const CreatorSchema = new mongoose.Schema({
  phone: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String, default: '' },
  handle: { type: String, unique: true, sparse: true, lowercase: true },
  bio: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  expertise: [{ type: String }],
  price: { type: Number, default: 99 },
  pricePerQuestion: { type: Number, default: 99 }, // From Phase 3 prompt
  responseTime: { type: String, default: '48 hours' }, // From Phase 3 prompt
  questionsAnswered: { type: Number, default: 0 }, // From Phase 3 prompt
  dailyCap: { type: Number, default: 50 },
  weeklyGoal: { type: Number, default: 1500 },
  autoPause: { type: Boolean, default: true },
  isLive: { type: Boolean, default: true },
  isPaused: { type: Boolean, default: false },
  ama_enabled: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  bankLinked: { type: Boolean, default: false },
  bankAccountName: { type: String },
  bankAccountNumber: { type: String },
  bankIfsc: { type: String },
  pan: { type: String },
  instagramLinked: { type: Boolean, default: false },
  instagramHandle: { type: String },
  instagramFollowers: { type: Number },
  instagramAccessToken: { type: String }, // encrypted
  stats: {
    totalAnswered: { type: Number, default: 0 },
    replyRate: { type: Number, default: 0 },
    avgReplyTime: { type: Number, default: 0 }
  },
  authProvider: { type: String, default: 'local' },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Creator || mongoose.model('Creator', CreatorSchema);
