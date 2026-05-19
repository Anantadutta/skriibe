/**
 * @file Creator.js
 * @description Mongoose model for Skriibe Creators.
 */

const mongoose = require('mongoose');

const CreatorSchema = new mongoose.Schema({
  phone: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, default: '' },
  handle: { type: String, unique: true, sparse: true, lowercase: true },
  bio: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  expertise: { type: String, default: '' },
  price: { type: Number, default: 99 },
  pricePerQuestion: { type: Number, default: 99 }, // From Phase 3 prompt
  responseTime: { type: String, default: '48 hours' }, // From Phase 3 prompt
  questionsAnswered: { type: Number, default: 0 }, // From Phase 3 prompt
  dailyCap: { type: Number, default: 50 },
  ama_enabled: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  bankLinked: { type: Boolean, default: false },
  instagramConnected: { type: Boolean, default: false },
  instagramFollowers: { type: Number, default: 0 },
  instagramAccessToken: { type: String, default: '' }, // encrypted
  stats: {
    totalAnswered: { type: Number, default: 0 },
    replyRate: { type: Number, default: 0 },
    avgReplyTime: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Creator', CreatorSchema);
