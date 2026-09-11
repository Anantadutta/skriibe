require('dotenv').config({ path: 'c:\\Users\\dutta\\Downloads\\skriibe-main\\skriibe-main\\backend\\.env' });
const mongoose = require('mongoose');
const Creator = require('c:\\Users\\dutta\\Downloads\\skriibe-main\\skriibe-main\\backend\\models\\Creator.js');

async function removeCreator() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const result = await Creator.deleteOne({ handle: 'unknown' });
    console.log('Deleted creator:', result);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

removeCreator();
