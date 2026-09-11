const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/skriibe').then(async () => {
  const ChatSession = require('./backend/models/ChatSession.js');
  const Creator = require('./backend/models/Creator.js');
  
  const sessions = await ChatSession.find({ 'review.rating': { $exists: true, $ne: null } });
  console.log('Sessions with reviews:', sessions.length);
  for (const s of sessions) {
    console.log('Session ID:', s._id, 'CreatorId:', s.creatorId, 'Review:', s.review);
    const c = await Creator.findById(s.creatorId);
    console.log('Creator found?', !!c, c ? c.name : '');
  }
  process.exit();
}).catch(console.error);
