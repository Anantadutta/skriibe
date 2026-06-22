const mongoose = require('mongoose');

const EarningSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
  creatorName: { type: String, required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  orderNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['accumulating', 'swept'], default: 'accumulating' }
}, { timestamps: true });

module.exports = mongoose.models.Earning || mongoose.model('Earning', EarningSchema);
