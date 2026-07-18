require('dotenv').config();
const mongoose = require('mongoose');

async function fixProfile() {
  try {
    console.log("Connecting to the database...");
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log("Connected.");

    const Creator = require('./models/Creator');
    
    // The name to update to (you can change this if needed)
    const newName = "Ananta Dutta"; 
    const handle = "ananta_01";
    
    const result = await Creator.updateOne(
      { handle: handle },
      { $set: { name: newName } }
    );
    
    if (result.matchedCount > 0) {
      console.log(`\n✅ Success! Updated profile name to "${newName}" for handle: @${handle}`);
      console.log("Your profile will now show up in the creator discovery list!");
    } else {
      console.log(`\n❌ Could not find a creator with handle @${handle}`);
    }
  } catch (error) {
    console.error("Error updating profile:", error);
  } finally {
    process.exit(0);
  }
}

fixProfile();
