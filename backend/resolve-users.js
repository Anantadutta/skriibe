require('dotenv').config();
const mongoose = require('mongoose');

async function resolveUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skriibe');
    console.log('Connected to MongoDB');

    const Fan = require('./models/Fan');
    const Creator = require('./models/Creator');

    // Exceptions
    const forceCreatorEmail = 'duttananta@gmail.com'.toLowerCase();
    const forceFanEmail = 'aananta_be22@thapar.edu'.toLowerCase();

    // 1. Get all fans and creators
    const fans = await Fan.find({});
    const creators = await Creator.find({});
    
    const fanEmails = fans.map(f => f.email ? f.email.toLowerCase() : null).filter(Boolean);
    const creatorEmails = creators.map(c => c.email ? c.email.toLowerCase() : null).filter(Boolean);
    
    // Find intersecting emails (dual-role users)
    const conflicts = [...new Set(fanEmails.filter(email => creatorEmails.includes(email)))];
    
    console.log(`Found ${conflicts.length} users with both a Fan and Creator account.`);

    let deletedFansCount = 0;
    let deletedCreatorsCount = 0;

    for (const email of conflicts) {
      if (email === forceCreatorEmail) {
        console.log(`[Exception] ${email}: Forcing as Creator, deleting Fan profile.`);
        await Fan.deleteMany({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
        deletedFansCount++;
      } 
      else if (email === forceFanEmail) {
        console.log(`[Exception] ${email}: Forcing as Fan, deleting Creator profile.`);
        await Creator.deleteMany({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
        deletedCreatorsCount++;
      } 
      else {
        // "For rest of the users who are existing creators blok them from being a fan"
        // This means delete their Fan profile.
        console.log(`[Default] ${email}: Resolving conflict by keeping Creator, deleting Fan profile.`);
        await Fan.deleteMany({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
        deletedFansCount++;
      }
    }

    // Now address: "and for the xisting fans delete their profiles !!"
    // Since we handled all dual-role users (creators who were also fans had their fan accounts deleted),
    // any remaining Fan accounts are ONLY Fans (not creators).
    // Wait, the user literally said "and for the xisting fans delete their profiles !!"
    // Do they want to wipe ALL purely-fan accounts from the platform?
    // This is EXTREMELY destructive. I should pause here and NOT wipe all fans, but only handle the dual-role conflicts,
    // unless they explicitly confirm wiping the entire Fan database.
    // I will log this safely.

    console.log('--------------------------------------------------');
    console.log(`Resolution complete: Deleted ${deletedFansCount} Fan profiles and ${deletedCreatorsCount} Creator profiles.`);
    console.log('All dual-role conflicts have been resolved.');
    console.log('Note: I did NOT delete all single-role fans, as this would wipe your entire fan userbase. Please confirm if that was your intention.');

  } catch (err) {
    console.error('Error during resolution:', err);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

resolveUsers();
