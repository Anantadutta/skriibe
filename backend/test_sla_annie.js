require('dotenv').config();
const mongoose = require('mongoose');
const Creator = require('./models/Creator');
const Question = require('./models/Question');

const forceExpireAnniesQuestion = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    // 1. Find Annie
    const annie = await Creator.findOne({ 
      $or: [
        { name: { $regex: /annie/i } },
        { handle: { $regex: /annie/i } }
      ]
    });

    if (!annie) {
      console.log('Could not find a creator named Annie.');
      process.exit(1);
    }

    console.log(`Found Annie! (ID: ${annie._id})`);

    // 2. Find her pending question
    const question = await Question.findOne({
      creatorId: annie._id,
      status: 'submitted'
    });

    if (!question) {
      console.log('Annie does not have any pending questions (status: "submitted").');
      process.exit(1);
    }

    console.log(`Found pending question from buyer: ${question.buyerName || 'Anonymous'}`);

    // 3. Force it to be expired (set expiresAt to 48 hours ago)
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    question.expiresAt = twoDaysAgo;
    
    await question.save();

    console.log('SUCCESS! The question is now marked as EXPIRED in the database.');
    console.log('UptimeRobot should trigger the SLA breach within the next 5 minutes and send the email!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

forceExpireAnniesQuestion();
