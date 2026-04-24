const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  creatorId: { type: String, required: true },
  guestEmail: { type: String, required: true },
  questionText: { type: String, required: true },
  priceCharged: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'answered'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', QuestionSchema);
