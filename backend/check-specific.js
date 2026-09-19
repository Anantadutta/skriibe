require('dotenv').config();
const mongoose = require('mongoose');

async function checkSpecificUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skriibe');
    const Fan = require('./models/Fan');
    const Creator = require('./models/Creator');

    const email = 'aananta_be22@thapar.edu'.toLowerCase();
    
    const fan = await Fan.findOne({ email });
    const creator = await Creator.findOne({ email });

    console.log(`Checking ${email}...`);
    console.log(`Exists as Fan: ${!!fan}`);
    console.log(`Exists as Creator: ${!!creator}`);
    
    if (creator && !fan) {
      console.log('User is ONLY a creator right now. Deleting creator profile so they can sign up as a Fan.');
      await Creator.deleteOne({ email });
      console.log('Creator profile deleted.');
    }
    
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}
checkSpecificUser();
