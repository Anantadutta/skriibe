require('dotenv').config();
const mongoose = require('mongoose');

const checkDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB.");

  const Creator = require('./models/Creator');

  const creators = await Creator.find({ handle: 'anan_987' });
  console.log(`Found ${creators.length} creators with handle anan_987`);
  creators.forEach(c => {
    console.log(`ID: ${c._id}, Email: ${c.email}`);
  });
  
  process.exit(0);
};

checkDB().catch(console.error);
