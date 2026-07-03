require('dotenv').config();
const mongoose = require('mongoose');
const Creator = require('./models/Creator');

const checkAnnie = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const annie = await Creator.findOne({ 
      $or: [{ name: { $regex: /annie/i } }, { handle: { $regex: /annie/i } }]
    });

    if (annie) {
      console.log('--- ANNIE STATUS ---');
      console.log('isBanned:', annie.isBanned);
      console.log('suspensionUntil:', annie.suspensionUntil);
      console.log('strikes:', JSON.stringify(annie.strikes, null, 2));
    } else {
      console.log('Annie not found.');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
checkAnnie();
