const mongoose = require('mongoose');
const Creator = require('./models/Creator');
require('dotenv').config();

async function populateFollowers() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to DB');

    const creators = await Creator.find({ $or: [{ instagramFollowers: { $exists: false } }, { instagramFollowers: null }, { instagramFollowers: "" }] });
    console.log(`Found ${creators.length} creators without followers.`);

    const randomFollowers = ['10k', '15.2k', '5k', '250k', '1.2m', '8.5k', '45k'];
    
    for (const creator of creators) {
      const random = randomFollowers[Math.floor(Math.random() * randomFollowers.length)];
      creator.instagramFollowers = random;
      await creator.save();
      console.log(`Updated ${creator.name || creator.handle} with ${random}`);
    }

    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

populateFollowers();
