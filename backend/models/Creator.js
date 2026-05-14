/**
 * @file Creator.js
 * @description Mongoose model for Skriibe Creators (AMA).
 */

const mongoose = require('mongoose');

const CreatorSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: { type: String, default: '' },
  handle: { type: String, unique: true, sparse: true, lowercase: true },
  bio: { type: String, default: '' },
  expertise: [{ type: String }],
  avatarUrl: { type: String, default: '' },
  instagramHandle: { type: String, default: '' },
  price: { type: Number, default: 99 },
  dailyCap: { type: Number, default: 50 },
  dailyQuestionCount: { type: Number, default: 0 },
  ama_enabled: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  bankLinked: { type: Boolean, default: false },
  replyRate: { type: Number, default: 0 },
  avgReplyTime: { type: Number, default: 0 },
  totalAnswered: { type: Number, default: 0 },
  followers: { type: Number, default: 0 },
  lifetimeEarned: { type: Number, default: 0 },
  strikeCount: { type: Number, default: 0 },
  isBanned: { type: Boolean, default: false },
  isSuspended: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Creator', CreatorSchema);
