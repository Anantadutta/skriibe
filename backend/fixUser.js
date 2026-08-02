require('dotenv').config();
const mongoose = require('mongoose');
const Creator = require('./models/Creator');

async function fixUser() {
  try {
    // Attempt to connect to the database
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is missing in the .env file');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const email = 'tarun92deep@gmail.com';
    const user = await Creator.findOne({ email });

    if (!user) {
      console.log('User not found with email:', email);
      return;
    }

    user.name = 'Tarundeep';
    user.ama_enabled = true;
    
    await user.save();
    console.log('Successfully updated the user:', user.email);
    console.log('Name:', user.name);
    console.log('ama_enabled:', user.ama_enabled);

  } catch (error) {
    console.error('Error fixing user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB');
  }
}

fixUser();
