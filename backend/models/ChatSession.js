const mongoose = require('mongoose');

const ChatSessionSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
  fanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fan', required: true },
  startTime: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  endTime: { type: Date },
  status: { type: String, enum: ['active', 'ended'], default: 'active' },
  ratePerMinute: { type: Number, required: true },
  totalMinutes: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  deletedByFan: { type: Boolean, default: false },
  cancelledByFan: { type: Boolean, default: false },
  notifiedMissed: { type: Boolean, default: false },
  isFreeChat: { type: Boolean, default: false },
  isContinueChat: { type: Boolean, default: false },
  creatorJoined: { type: Boolean, default: false },
  creatorJoinedAt: { type: Date },
  fanAccepted: { type: Boolean, default: false },
  fanAcceptedAt: { type: Date },
  chatId: { type: String, unique: true, sparse: true },
  review: {
    rating: { type: Number },
    tags: [{ type: String }],
    feedback: { type: String },
    createdAt: { type: Date }
  }
});

module.exports = mongoose.models.ChatSession || mongoose.model('ChatSession', ChatSessionSchema);
