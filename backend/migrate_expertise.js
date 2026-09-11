require('dotenv').config();
const mongoose = require('mongoose');
const Creator = require('./models/Creator');
const { normalizeExpertiseList } = require('./utils/expertiseConstants');

async function migrateExpertise() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is not set in environment.');
    return;
  }

  let needDisconnect = false;
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
    needDisconnect = true;
  }

  try {
    const creators = await Creator.find({});
    console.log(`Checking ${creators.length} creators for expertise migration...`);

    let updatedCount = 0;
    for (const c of creators) {
      if (!c.expertise || !Array.isArray(c.expertise) || c.expertise.length === 0) continue;

      const original = JSON.stringify(c.expertise);
      const normalized = normalizeExpertiseList(c.expertise);
      const updated = JSON.stringify(normalized);

      if (c.handle === 'ntnsain7' || (c.name && c.name.toLowerCase() === 'nitin')) {
        const hasLifestyle = Array.isArray(c.expertise) && c.expertise.includes('Lifestyle');
        if (!hasLifestyle || (Array.isArray(c.expertise) && c.expertise.includes('Life'))) {
          const currentExp = Array.isArray(c.expertise) ? c.expertise : [];
          const updatedNitin = normalizeExpertiseList([...currentExp.filter(e => e.toLowerCase() !== 'life'), 'Lifestyle']);
          c.expertise = updatedNitin;
          await Creator.updateOne({ _id: c._id }, { $set: { expertise: updatedNitin } });
          console.log(`Updated Nitin's expertise to:`, updatedNitin);
          updatedCount++;
          continue;
        }
      }

      if (original !== updated) {
        c.expertise = normalized;
        await Creator.updateOne({ _id: c._id }, { $set: { expertise: normalized } });
        console.log(`Updated creator @${c.handle || c.name || c._id}: ${original} -> ${updated}`);
        updatedCount++;
      }
    }

    console.log(`Expertise migration completed. Total updated: ${updatedCount}`);
  } catch (err) {
    console.error('Error during expertise migration:', err);
  } finally {
    if (needDisconnect) {
      await mongoose.disconnect();
    }
  }
}

if (require.main === module) {
  migrateExpertise().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = migrateExpertise;
