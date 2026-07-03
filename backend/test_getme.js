require('dotenv').config();
const mongoose = require('mongoose');
const Creator = require('./models/Creator');

const testGetMe = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const creator = await Creator.findOne({ 
      $or: [{ name: { $regex: /annie/i } }, { handle: { $regex: /annie/i } }]
    });

    if (!creator) {
      console.log('Creator not found');
      process.exit(1);
    }
    
    if (creator.isBanned) {
      console.log('403: Account permanently removed');
      process.exit(1);
    }

    let activeStrikesCount = 0;
    try {
      if (creator.strikes && creator.strikes.length > 0) {
        const activeStrikes = creator.strikes.filter(s => !s.isExpired);
        if (activeStrikes.length > 0) {
          const sortedActive = [...activeStrikes].sort((a, b) => new Date(b.date) - new Date(a.date));
          const mostRecentStrike = sortedActive[0];
          const daysSinceLastStrike = (new Date() - new Date(mostRecentStrike.date)) / (1000 * 60 * 60 * 24);
          if (daysSinceLastStrike <= 90) {
            activeStrikesCount = activeStrikes.length;
          }
        }
      }
      console.log('Calculated activeStrikesCount:', activeStrikesCount);
      console.log('SUCCESS! No crash here.');
    } catch (e) {
      console.error('CRASH in activeStrikes calculation:', e);
    }

    process.exit(0);
  } catch (err) {
    console.error('Global CRASH:', err);
    process.exit(1);
  }
};
testGetMe();
