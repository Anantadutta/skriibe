require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const ChatSession = require('./backend/models/ChatSession');
  const session = await ChatSession.findOne().sort({_id: -1})
    .populate('creatorId', 'name liveChatPrice')
    .populate('fanId', 'name walletBalance');
  console.log(JSON.stringify(session, null, 2));
  process.exit(0);
}
run();
