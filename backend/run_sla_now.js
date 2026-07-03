require('dotenv').config();
const mongoose = require('mongoose');
const { runSlaMonitor } = require('./cron/slaMonitor');

const testMonitor = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB, running SLA Monitor manually...");
        await runSlaMonitor();
        console.log("Done! Check your admin panel now!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
testMonitor();
