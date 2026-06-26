const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Question = require('./models/Question');
const Counter = require('./models/Counter');

async function backfillDisputes() {
  try {
    console.log('Connecting to MongoDB...', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    // 1. Backfill Buyer Disputes (status: flagged)
    const buyerDisputes = await Question.find({ status: 'flagged', disputeId: { $exists: false } }).sort({ createdAt: 1 });
    console.log(`Found ${buyerDisputes.length} buyer disputes without disputeId.`);
    
    for (const d of buyerDisputes) {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'buyerDisputeId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      d.disputeId = 'bu' + String(counter.seq).padStart(4, '0');
      await d.save();
      console.log(`Updated buyer dispute ${d._id} -> ${d.disputeId}`);
    }

    // 2. Backfill Creator Disputes (status: rejected)
    const creatorDisputes = await Question.find({ status: 'rejected', disputeId: { $exists: false } }).sort({ createdAt: 1 });
    console.log(`Found ${creatorDisputes.length} creator disputes without disputeId.`);
    
    for (const d of creatorDisputes) {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'creatorDisputeId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      d.disputeId = 'cr' + String(counter.seq).padStart(4, '0');
      await d.save();
      console.log(`Updated creator dispute ${d._id} -> ${d.disputeId}`);
    }

    console.log('Backfill complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error during backfill:', err);
    process.exit(1);
  }
}

backfillDisputes();
