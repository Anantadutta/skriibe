const mongoose = require('mongoose');
const AdminAlert = require('./backend/models/AdminAlert');
require('dotenv').config({ path: './backend/.env' });

async function insert() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skriibe');
    await AdminAlert.create({
      type: 'creator_reject',
      title: 'Creator rejected message',
      message: 'Creator rejected message #123456: testing backend',
      referenceId: new mongoose.Types.ObjectId()
    });
    console.log('Inserted successfully!');
  } catch(e) {
    console.error('Error:', e);
  }
  process.exit(0);
}
insert();
