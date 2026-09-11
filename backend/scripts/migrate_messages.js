const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const ChatSession = require('../models/ChatSession');
const Message = require('../models/Message');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected for Migration'))
  .catch(err => console.error(err));

async function runMigration() {
  try {
    const sessions = await ChatSession.find({});
    console.log(`Found ${sessions.length} sessions.`);
    
    let messageCount = 0;
    
    for (const session of sessions) {
      if (session.messages && session.messages.length > 0) {
        for (const msg of session.messages) {
          const newMessage = new Message({
            messageId: msg._id.toString(), // Use old ObjectId as UUID for simplicity
            sessionId: session._id,
            creatorId: session.creatorId,
            fanId: session.fanId,
            senderRole: msg.sender,
            content: msg.content,
            sentAt: msg.timestamp || new Date(),
            deliveredAt: new Date(),
            readAt: new Date() // Since it's old history
          });
          
          await newMessage.save().catch(e => {
            if (e.code !== 11000) console.error(e);
          });
          messageCount++;
        }
      }
    }
    
    console.log(`Migrated ${messageCount} messages to standalone Message collection.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
