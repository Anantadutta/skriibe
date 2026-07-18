require('dotenv').config();
const mongoose = require('mongoose');
const Creator = require('./models/Creator');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const handle = 'ananta_01';
  const creator = await Creator.findOne({ handle });
  
  if (!creator) {
    console.log(`Creator with handle ${handle} not found.`);
  } else {
    console.log(`Creator found:`);
    console.log(`- handle: ${creator.handle}`);
    console.log(`- name: ${creator.name}`);
    console.log(`- isPaused: ${creator.isPaused}`);
    console.log(`- isBanned: ${creator.isBanned}`);
    console.log(`- ama_enabled: ${creator.ama_enabled}`);
    console.log(`- suspensionUntil: ${creator.suspensionUntil}`);
    
    let reason = [];
    if (creator.isPaused === true) reason.push('isPaused is true');
    if (creator.isBanned === true) reason.push('isBanned is true');
    if (!creator.ama_enabled) reason.push('ama_enabled is not true');
    if (!creator.handle) reason.push('handle is empty');
    if (!creator.name) reason.push('name is empty');
    if (creator.suspensionUntil && new Date(creator.suspensionUntil) > new Date()) reason.push('Suspended');
    
    if (reason.length > 0) {
      console.log(`Reasons for not showing: ${reason.join(', ')}`);
    } else {
      console.log(`The creator SHOULD be showing up in the public API. No exclusionary flags found.`);
    }
  }

  process.exit(0);
}

main().catch(console.error);
