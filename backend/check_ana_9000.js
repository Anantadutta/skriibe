const mongoose = require('mongoose');
const Creator = require('./models/Creator');

async function check() {
  require('dotenv').config();
  await mongoose.connect(process.env.MONGO_URI);
  const creator = await Creator.findOne({ handle: /ana_9000/i });
  console.log("CREATOR:", JSON.stringify(creator, null, 2));
  process.exit(0);
}

check();
