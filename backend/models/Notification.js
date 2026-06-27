const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    fanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fan', required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    answerText: { type: String, required: false },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
