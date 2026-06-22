const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    fanName: { type: String, default: '' },
    creatorHandle: { type: String, required: true },
    amountPaid: { type: Number, default: 0 }, // in INR
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
