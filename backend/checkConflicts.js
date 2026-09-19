require('dotenv').config();
const mongoose = require('mongoose');
const Fan = require('./models/Fan');
const Creator = require('./models/Creator');

async function checkConflicts() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skriibe');
    
    const fans = await Fan.find({});
    const creators = await Creator.find({});
    
    const fanEmails = fans.map(f => f.email ? f.email.toLowerCase() : null).filter(Boolean);
    const creatorEmails = creators.map(c => c.email ? c.email.toLowerCase() : null).filter(Boolean);
    
    const conflicts = [...new Set(fanEmails.filter(email => creatorEmails.includes(email)))];
    
    console.log('Total Fans:', fans.length);
    console.log('Total Creators:', creators.length);
    console.log('Conflicting Emails:', conflicts);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}
checkConflicts();
