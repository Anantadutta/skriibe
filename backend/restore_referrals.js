require('dotenv').config();
const mongoose = require('mongoose');
const Earning = require('./models/Earning');
const Question = require('./models/Question');
const Creator = require('./models/Creator');

async function restore() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const affiliateEarningsList = await Earning.find({ earningType: 'affiliate_referral' });
    console.log(`Found ${affiliateEarningsList.length} affiliate earnings.`);

    for (const e of affiliateEarningsList) {
      if (!e.questionId) continue;
      const q = await Question.findById(e.questionId).select('creatorId');
      if (q && q.creatorId) {
        const referredCreator = await Creator.findById(q.creatorId);
        if (referredCreator && !referredCreator.referredBy) {
          referredCreator.referredBy = e.creatorId;
          await referredCreator.save();
          await Creator.findByIdAndUpdate(e.creatorId, { $inc: { totalReferrals: 1 } });
          console.log(`Restored referral: ${referredCreator.handle} referred by ${e.creatorId}`);
        }
      }
    }
    
    console.log("Restore complete!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

restore();
