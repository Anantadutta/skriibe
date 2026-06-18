const mongoose = require('mongoose');
require('dotenv').config();
const Fan = require('./models/Fan');
const Creator = require('./models/Creator');
const CreatorProfile = require('./models/CreatorProfile');

async function testUpgrade() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skriibe');
    console.log('Connected to DB');

    // Find the fan with name converted_creator, or the last fan created
    let fan = await Fan.findOne().sort({ createdAt: -1 });
    if (!fan) {
      console.log('No fan found');
      return;
    }
    console.log('Found fan:', fan.email);

    const creator_name = 'converted_creator';
    const bio = 'im here now';
    const category = 'Health & Fitness';

    if (!fan.roles.includes('creator')) {
      fan.roles.push('creator');
      fan.activeRole = 'creator';
      await fan.save();
      console.log('Fan roles updated');
    }

    let profile = await CreatorProfile.findOne({ user: fan._id });
    if (!profile) {
      profile = new CreatorProfile({
        user: fan._id,
        creator_name,
        bio,
        category
      });
      await profile.save();
      console.log('CreatorProfile created');
    } else {
      profile.creator_name = creator_name;
      profile.bio = bio;
      profile.category = category;
      await profile.save();
      console.log('CreatorProfile updated');
    }

    let creator = await Creator.findOne({ email: fan.email.toLowerCase() });
    if (!creator) {
      let baseHandle = creator_name.toLowerCase().replace(/\s+/g, '');
      let uniqueHandle = baseHandle;
      let counter = 1;
      while (await Creator.findOne({ handle: uniqueHandle })) {
        uniqueHandle = baseHandle + counter;
        counter++;
      }

      creator = new Creator({
        email: fan.email.toLowerCase(),
        password: fan.password,
        name: creator_name,
        handle: uniqueHandle,
        bio: bio,
        expertise: [category],
        fanId: fan._id
      });
      await creator.save();
      console.log('Creator created');
    } else {
      creator.fanId = fan._id;
      if (!creator.name) creator.name = creator_name;
      await creator.save();
      console.log('Creator updated');
    }

    console.log('SUCCESS');
  } catch (err) {
    console.error('ERROR ENCOUNTERED:', err);
  } finally {
    mongoose.disconnect();
  }
}

testUpgrade();
