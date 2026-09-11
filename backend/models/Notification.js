const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    fanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fan', required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    actionUrl: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
