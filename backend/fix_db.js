const mongoose = require('mongoose');
const Creator = require('./models/Creator');
require('dotenv').config();

async function fixDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await Creator.updateMany(
      { 'stats.replyRate': 0 },
      { $set: { 'stats.replyRate': 100 } }
    );
    console.log(`Successfully fixed ${result.modifiedCount} creators!`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

fixDB();
