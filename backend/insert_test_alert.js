require('dotenv').config();
const mongoose = require('mongoose');
const AdminAlert = require('./models/AdminAlert');
const Creator = require('./models/Creator');

const insertAlert = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const creator = await Creator.findOne({ email: 'duttananta@gmail.com' }); // Annie
        
        if (creator) {
            await AdminAlert.create({
                type: 'sla_breach',
                title: 'SLA Breach - Strike 1',
                message: `Creator @${creator.handle} missed reply window for Q#1a2b3c. Strike 1 issued.`,
                referenceId: creator._id
            });
            console.log("Success! Alert injected into the DB.");
        } else {
            console.log("Could not find Annie.");
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
insertAlert();
