const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/skriibe', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const creatorSchema = new mongoose.Schema({}, { strict: false });
    const Creator = mongoose.model('Creator', creatorSchema);
    
    const result = await Creator.updateOne(
      { handle: 'vasundhara' },
      { $set: { avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop' } }
    );
    
    if (result.modifiedCount > 0) {
      console.log("Vasundhara's local picture updated successfully!");
    } else {
      console.log("Found Vasundhara, but picture was already set or handle not found.");
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
