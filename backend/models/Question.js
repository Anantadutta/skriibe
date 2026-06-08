/**
 * @module Question — Paid question submitted by a buyer to a creator on skriibe
 */
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema(
  {
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
    handle: { type: String, required: true }, // denormalized for fast lookup

    // Buyer info
    fanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fan' },
    buyerName: { type: String, default: '' },
    buyerPhone: { type: String, required: false }, // Made false to support Fan flow
    buyerEmail: { type: String, default: '' },
    isAnonymous: { type: Boolean, default: false },

    // Question
    questionText: { type: String, required: true, minlength: 20, maxlength: 500 },
    isFollowUp: { type: Boolean, default: false },
    parentQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },

    // Payment
    amountPaid: { type: Number, required: false }, // in INR
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    paid: { type: Boolean, default: false },

    // Status
    status: {
      type: String,
      enum: ['submitted', 'answered', 'expired', 'flagged', 'rejected'],
      default: 'submitted',
    },
    flagReason: { type: String, default: '' },
    rejectReason: { type: String, default: '' },
    answerText: { type: String, default: '' },
    answeredAt: { type: Date },
    expiresAt: { type: Date }, // SLA deadline — set on creation based on creator's responseTime
    
    // Admin Resolution
    adminNotes: { type: String, default: '' },
    adminDecision: { type: String, enum: ['pending', 'creator_wins', 'fan_wins', 'banned', 'deleted'], default: 'pending' },
    isBuyerBanned: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Question || mongoose.model('Question', QuestionSchema);
