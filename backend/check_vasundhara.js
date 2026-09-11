const mongoose = require('mongoose');

const checkDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/skriibe', { useNewUrlParser: true, useUnifiedTopology: true });
    
    // Quick schema
    const creatorSchema = new mongoose.Schema({}, { strict: false });
    const Creator = mongoose.model('Creator', creatorSchema);
    
    const vasundhara = await Creator.findOne({ handle: 'vasundhara' });
    console.log("Found Vasundhara:", vasundhara);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkDB();
