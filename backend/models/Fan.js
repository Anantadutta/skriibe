/**
 * @file Fan.js
 * @description Mongoose model for Skriibe Fans (users).
 */

const mongoose = require('mongoose');

const FanSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Fan', FanSchema);
