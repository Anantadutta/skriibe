const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/skriibe');
  const creators = await mongoose.connection.collection('creators').find().sort({_id:-1}).limit(1).toArray();
  console.log("LATEST CREATOR:", JSON.stringify(creators, null, 2));
  process.exit(0);
}
run();
