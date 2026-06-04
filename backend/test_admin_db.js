const mongoose = require('mongoose');
require('dotenv').config();
const Creator = require('./models/Creator');
const Fan = require('./models/Fan');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected");
  const creators = await Creator.find({});
  console.log("Creators:", creators.length);
  const fans = await Fan.find({});
  console.log("Fans:", fans.length);
  process.exit(0);
}

test();
