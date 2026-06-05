const mongoose = require('mongoose');

const AdminAlertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['creator_signup', 'fan_signup', 'creator_reject', 'creator_flag', 'buyer_flag'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId, required: false }, // Dynamic reference to Question, Creator, or Fan
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.models.AdminAlert || mongoose.model('AdminAlert', AdminAlertSchema);
