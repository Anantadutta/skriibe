const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const Question = require('./models/Question');
    const questions = await Question.find({}).sort({createdAt: -1}).limit(5);
    console.log("Latest 5 questions:", questions.map(q => ({
      _id: q._id,
      creatorId: q.creatorId,
      status: q.status,
      paymentStatus: q.paymentStatus,
      text: q.questionText
    })));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
