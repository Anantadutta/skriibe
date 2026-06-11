require('dotenv').config();
const mongoose = require('mongoose');

const checkDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB.");

  const Question = require('./models/Question');
  const Creator = require('./models/Creator');

  const anan = await Creator.findOne({ handle: 'anan_987' });
  if (!anan) {
    console.log("Creator anan_987 not found");
  } else {
    console.log("Creator found:", anan._id);
    const questions = await Question.find({ creatorId: anan._id });
    console.log("Questions for anan_987:", questions.length);
    if (questions.length > 0) {
      console.log("Latest question status:", questions[questions.length - 1].status);
      console.log("Latest question creatorId:", questions[questions.length - 1].creatorId);
    }
  }
  
  process.exit(0);
};

checkDB().catch(console.error);
