const mongoose = require('mongoose');

const WalletTransactionSchema = new mongoose.Schema({
  fanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fan', required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator' },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  reference: { type: String }, // e.g., 'razorpay_payment_id' or 'chat_session_id'
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.WalletTransaction || mongoose.model('WalletTransaction', WalletTransactionSchema);
