require('dotenv').config();
const mongoose = require('mongoose');

const debug = async () => {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        console.log('Connecting to:', uri);
        await mongoose.connect(uri);
        console.log('Connected!');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n--- Collections in this database ---');
        for (let col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(`- ${col.name} (${count} documents)`);
        }

        if (collections.length === 0) {
            console.log('No collections found. Are you sure you are in the right database?');
        } else {
            console.log('\n--- Sample Data from "waitlists" ---');
            const data = await mongoose.connection.db.collection('waitlists').find().limit(3).toArray();
            console.log(JSON.stringify(data, null, 2));
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
};

debug();
