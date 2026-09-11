require('dotenv').config();
const mongoose = require('mongoose');
const Referral = require('./models/Referral');
const Creator = require('./models/Creator');
const fs = require('fs');

async function dump() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const allRefs = await Referral.find({}).lean();
    console.log(`Found ${allRefs.length} referrals in database.`);
    
    // Dump to JSON
    fs.writeFileSync('debug_referrals.json', JSON.stringify(allRefs, null, 2));
    console.log("Dumped to debug_referrals.json");
    
    // Check if there are duplicates with the same handle
    const handleCount = {};
    for (const ref of allRefs) {
      const handle = ref.handle;
      handleCount[handle] = (handleCount[handle] || 0) + 1;
    }
    console.log("Handle counts:", handleCount);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

dump();
