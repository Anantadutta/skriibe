require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const collections = await mongoose.connection.db.collection('creators').find({}).toArray();
  console.log(collections.map(c => c.handle));
  process.exit(0);
}
run();
