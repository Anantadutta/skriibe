const mongoose = require('mongoose');
const ChatSession = require('./models/ChatSession');
const Creator = require('./models/Creator');
require('dotenv').config({path: './backend/.env'});

async function checkDanglingSessions() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      
      
    });
    console.log('Connected to MongoDB');

    // Find all active sessions
    const activeSessions = await ChatSession.find({ status: 'active' }).populate('creatorId');
    console.log(`Found ${activeSessions.length} total active sessions.`);

    for (const session of activeSessions) {
      if (!session.creatorId) {
        console.log(`Session ${session._id} has no creator (deleted?). Ending it.`);
        session.status = 'ended';
        session.endReason = 'CREATOR_DELETED';
        await session.save();
        continue;
      }
      const creatorName = session.creatorId.name || session.creatorId.handle;
      console.log(`Active session: ${session._id} for creator ${creatorName} (Joined: ${session.creatorJoined}, Start: ${session.startTime})`);

      // Let's close sessions older than 24 hours
      const ONE_DAY = 24 * 60 * 60 * 1000;
      if (new Date() - new Date(session.createdAt) > ONE_DAY) {
        console.log(`Session ${session._id} is older than 24h. Ending it.`);
        session.status = 'ended';
        session.endReason = 'AUTO_CLEANUP';
        await session.save();
      }
    }

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDanglingSessions();
