const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  messageId: { type: String, required: true, unique: true }, // UUID from client
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession', required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
  fanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fan', required: true },
  senderRole: { type: String, enum: ['creator', 'fan', 'system'], required: true },
  content: { type: String, required: true },
  sentAt: { type: Date, required: true, index: true },
  deliveredAt: { type: Date, default: null },
  readAt: { type: Date, default: null },
  reactions: [{
    emoji: { type: String },
    senderRole: { type: String, enum: ['creator', 'fan'] }
  }]
});

// Compound index for efficient pagination/queries per thread
MessageSchema.index({ creatorId: 1, fanId: 1, sentAt: -1 });
MessageSchema.index({ sessionId: 1, sentAt: -1 });

module.exports = mongoose.models.Message || mongoose.model('Message', MessageSchema);
