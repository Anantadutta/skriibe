const mongoose = require('mongoose');
const AdminAlert = require('./backend/models/AdminAlert');
const Question = require('./backend/models/Question');
const Creator = require('./backend/models/Creator');
const Fan = require('./backend/models/Fan');
require('dotenv').config({ path: './backend/.env' });

async function backfill() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skriibe');
    
    // Clear existing alerts to avoid duplicates
    await AdminAlert.deleteMany({});
    console.log('Cleared existing alerts');

    // Backfill creator disputes (rejections and flags)
    const disputes = await Question.find({ status: { $in: ['rejected', 'flagged'] } });
    for (const d of disputes) {
      if (d.status === 'rejected') {
        await AdminAlert.create({
          type: 'creator_reject',
          title: 'Creator rejected question',
          message: `Creator rejected question #${d._id.toString().slice(-6)}: ${d.rejectReason || 'expertise'}`,
          referenceId: d._id,
          createdAt: d.updatedAt
        });
      } else if (d.status === 'flagged') {
        await AdminAlert.create({
          type: 'buyer_flag',
          title: 'Buyer flagged a reply',
          message: `Buyer flagged reply for question #${d._id.toString().slice(-6)}`,
          referenceId: d._id,
          createdAt: d.updatedAt
        });
      }
    }
    
    // Backfill some recent creator signups
    const creators = await Creator.find({}).sort({ createdAt: -1 }).limit(5);
    for (const c of creators) {
      await AdminAlert.create({
        type: 'creator_signup',
        title: 'New creator signup',
        message: `Creator signed up via Phone: ${c.phone || c.email}`,
        referenceId: c._id,
        createdAt: c.createdAt
      });
    }

    // Backfill some recent fan signups
    const fans = await Fan.find({}).sort({ createdAt: -1 }).limit(5);
    for (const f of fans) {
      await AdminAlert.create({
        type: 'fan_signup',
        title: 'New fan signup',
        message: `Fan signed up: ${f.email || f.phone}`,
        referenceId: f._id,
        createdAt: f.createdAt
      });
    }

    console.log('Backfill complete!');
  } catch(e) {
    console.error('Error:', e);
  }
  process.exit(0);
}
backfill();
