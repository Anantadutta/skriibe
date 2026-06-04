const mongoose = require('mongoose');
require('dotenv').config();
const Question = require('./models/Question');
const Creator = require('./models/Creator');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const questions = await Question.find({ status: 'submitted' }).populate('creatorId');
    console.log(JSON.stringify(questions, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
