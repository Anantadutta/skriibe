require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const Creator = require('./backend/models/Creator');

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skriibe');
  const creators = await Creator.find({});
  console.log('Creators:', creators.map(c => ({ handle: c.handle, isLive: c.isLive })));
  process.exit(0);
}

run();
