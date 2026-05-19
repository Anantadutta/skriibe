require('dotenv').config();
const mongoose = require('mongoose');
const Creator = require('./models/Creator');

const checkDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const creators = await Creator.find({});
  console.log('Found creators:', creators.length);
  creators.forEach(c => console.log(`- ${c.handle} (${c.name})`));
  process.exit(0);
};

checkDB().catch(err => {
  console.error(err);
  process.exit(1);
});
