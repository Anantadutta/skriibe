const mongoose = require('mongoose');
const AdminAlert = require('./backend/models/AdminAlert');
require('dotenv').config({ path: './backend/.env' });
const fs = require('fs');

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skriibe');
    const alerts = await AdminAlert.find({});
    fs.writeFileSync('alerts_out.txt', JSON.stringify(alerts, null, 2));
  } catch(e) {
    fs.writeFileSync('alerts_out.txt', 'Error: ' + e.message);
  }
  process.exit(0);
}
check();
