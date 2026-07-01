const mongoose = require('mongoose');

const MONGO_URI = "mongodb://Ananta:Ananta3139@ac-9ykfn9e-shard-00-00.gmbikxr.mongodb.net:27017,ac-9ykfn9e-shard-00-01.gmbikxr.mongodb.net:27017,ac-9ykfn9e-shard-00-02.gmbikxr.mongodb.net:27017/?ssl=true&replicaSet=atlas-10vedy-shard-0&authSource=admin&appName=SkriibeDB";

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    const Question = require('./models/Question');
    const Creator = require('./models/Creator');

    // Assuming creator handle is Ananta or something
    const creator = await Creator.findOne({ "handle": "Anantadutta" });
    if (!creator) {
      console.log("Creator not found");
      const c2 = await Creator.findOne({ "name": "Ananta" });
      if (c2) console.log("Creator found by name", c2.creatorId);
    } else {
      console.log("Creator found", creator.creatorId);
    }
    
    const creatorId = creator ? creator.creatorId : (await Creator.findOne({ "name": "Ananta" })).creatorId;

    const questions = await Question.find({ creatorId }).sort({ createdAt: -1 });
    console.log("Questions total:", questions.length);
    for (let q of questions) {
      console.log(`Q: ${q._id}, text: ${q.questionText}, status: ${q.status}, amountPaid: ${q.amountPaid}, isFollowUp: ${q.isFollowUp}, answeredAt: ${q.answeredAt}, adminDecision: ${q.adminDecision}`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
