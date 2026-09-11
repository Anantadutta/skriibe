const mongoose = require('mongoose');

const SweepLogSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
  amountSwept: { type: Number, required: true },
  sweptAt: { type: Date, default: Date.now },
  weekStart: { type: Date },
  weekEnd: { type: Date },
  status: { type: String, default: 'Completed' },
  transactionCount: { type: Number, default: 0 }
});

module.exports = mongoose.models.SweepLog || mongoose.model('SweepLog', SweepLogSchema);
