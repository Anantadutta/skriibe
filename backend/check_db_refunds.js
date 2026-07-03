require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');
const Creator = require('./models/Creator');

const checkDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const adminRefundsList = await Question.find({
            adminDecision: { $in: ['fan_wins', 'partial_refund'] }
        }).populate('creatorId', 'name handle email').lean();

        console.log("Found refunds:", adminRefundsList.length);
        adminRefundsList.forEach(q => {
            console.log(`Q: ${q.questionText}`);
            console.log(`CreatorId field:`, q.creatorId);
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkDb();
