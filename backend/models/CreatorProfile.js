/**
 * @file CreatorProfile.js
 * @description Mongoose model for upgraded Creator Profiles linked to a Fan.
 */

const mongoose = require('mongoose');

const CreatorProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Fan', required: true, unique: true },
  creator_name: { type: String, required: true },
  bio: { type: String, required: true },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

CreatorProfileSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.models.CreatorProfile || mongoose.model('CreatorProfile', CreatorProfileSchema);
