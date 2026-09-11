/**
 * @file Creator.js
 * @description Mongoose model for Skriibe Creators.
 */

const mongoose = require('mongoose');

const CreatorSchema = new mongoose.Schema({
  phone: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  isEmailVerified: { type: Boolean, default: false },
  password: { type: String },
  name: { type: String, default: '' },
  handle: { type: String, unique: true, sparse: true, lowercase: true },
  profileUrl: { type: String, default: '' },
  bio: { type: String, default: "Heyyy! Got something on your mind? Let’s chat!" },
  avatarUrl: { type: String, default: '' },
  expertise: [{ type: String }],
  price: { type: Number, default: 10 },
  pricePerQuestion: { type: Number, default: 10 }, // From Phase 3 prompt
  responseTime: { type: String, default: '48 hours' }, // From Phase 3 prompt
  questionsAnswered: { type: Number, default: 0 }, // From Phase 3 prompt
  dailyCap: { type: Number, default: 50 },
  weeklyGoal: { type: Number, default: 1500 },
  autoPause: { type: Boolean, default: true },
  isLive: { type: Boolean, default: false },
  isPaused: { type: Boolean, default: false },
  ama_enabled: { type: Boolean, default: false },
  liveChatEnabled: { type: Boolean, default: true }, // New field for Live Chat feature
  liveChatPrice: { type: Number, default: 5 }, // Price per minute for Live Chat
  liveChatDevotedHours: { type: Number, default: 2 }, // How many hours the creator can devote in a day
  liveChatTimeSlots: [{ type: String }], // Specific time slots they will be live
  verified: { type: Boolean, default: false },
  bankLinked: { type: Boolean, default: false },
  bankAccountName: { type: String },
  bankAccountNumber: { type: String },
  bankIfsc: { type: String },
  verifiedAccountNumber: { type: String },
  verifiedIfsc: { type: String },
  bankVerificationStatus: { type: String, enum: ['pending', 'verified', 'failed'], default: 'pending' },
  bankNameAtBank: { type: String },
  bankVerifiedAt: { type: Date },
  bankNeedsReview: { type: Boolean, default: false },
  panNumber: { type: String },
  panType: { type: String },
  panVerificationStatus: { type: String, enum: ['pending', 'verified', 'failed'], default: 'pending' },
  panRegisteredName: { type: String },
  panVerifiedAt: { type: Date },
  panNeedsReview: { type: Boolean, default: false },
  aadharLast4: { type: String, default: '' },
  payoutMethod: { type: String, enum: ['upi', 'bank'], default: 'upi' },
  upiId: { type: String, default: '' },
  payoutSetupCompleted: { type: Boolean, default: false },
  payoutDetailsConfirmed: { type: Boolean, default: false },
  instagramLinked: { type: Boolean, default: false },
  instagramHandle: { type: String },
  instagramFollowers: { type: mongoose.Schema.Types.Mixed },
  instagramAccessToken: { type: String }, // encrypted
  instagramMedia: [{
    id: String,
    caption: String,
    media_type: String,
    media_url: String,
    thumbnail_url: String,
    permalink: String
  }],

  stats: {
    totalAnswered: { type: Number, default: 0 },
    replyRate: { type: Number, default: 100 },
    avgReplyTime: { type: Number, default: 0 }
  },
  commissionOverride: {
    creatorShare: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date }
  },
  availableBalance: { type: Number, default: 0 },
  lifetimePaid: { type: Number, default: 0 },
  authProvider: { type: String, default: 'local' },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator' },
  referredByName: { type: String },
  totalReferrals: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  // SLA Strikes System
  strikes: [{
    strikeLevel: Number,
    date: Date,
    reason: String,
    questionId: mongoose.Schema.Types.ObjectId,
    isExpired: { type: Boolean, default: false }
  }],
  suspensionUntil: { type: Date },
  payoutsFrozenUntil: { type: Date },
  isBanned: { type: Boolean, default: false },
  blacklisted: { type: Boolean, default: false },
  pendingEarningsHoldUntil: { type: Date },
  earningsReleased: { type: Boolean, default: false },
  payoutAlertSent: { type: Boolean, default: false }
});

const { normalizeExpertiseList } = require('../utils/expertiseConstants');

CreatorSchema.post('init', function(doc) {
  if (doc && doc.expertise && Array.isArray(doc.expertise)) {
    doc.expertise = normalizeExpertiseList(doc.expertise);
  }
});

CreatorSchema.pre('save', function(next) {
  if (this.expertise && Array.isArray(this.expertise)) {
    this.expertise = normalizeExpertiseList(this.expertise);
  }
  if (typeof next === 'function') next();
});

module.exports = mongoose.models.Creator || mongoose.model('Creator', CreatorSchema);

