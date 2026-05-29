const mongoose = require('mongoose');

const DeletedAccountReasonSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator' },
  reason: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DeletedAccountReason', DeletedAccountReasonSchema);
