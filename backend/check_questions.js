require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');
const Creator = require('./models/Creator');

const check = async () => {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        await mongoose.connect(uri);
        
        console.log('--- Questions ---');
        const questions = await Question.find({});
        console.log(JSON.stringify(questions, null, 2));

        console.log('--- Creators ---');
        const creators = await Creator.find({});
        console.log(JSON.stringify(creators, null, 2));

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
};

check();
