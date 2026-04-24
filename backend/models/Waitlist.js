const mongoose = require('mongoose');

const WaitlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  instagramHandle: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  whatsappNumber: { type: String, required: true },
  expertise: { type: String, required: true },
  followerCount: { type: String, required: true },
  status: { type: String, default: 'pending' },
  joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Waitlist', WaitlistSchema);
