const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const { processAffiliateEarning } = require('./utils/affiliateEarning');
const ChatSession = require('./models/ChatSession');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const sessions = await ChatSession.find({ status: 'ended', totalCost: { $gt: 0 } });
        console.log(`Found ${sessions.length} ended chat sessions with cost > 0`);

        let count = 0;
        for (const session of sessions) {
            await processAffiliateEarning(
                session.creatorId,
                session._id,
                'CHAT-REF-' + session._id.toString().substring(0, 6),
                session.totalCost,
                'chat'
            );
            count++;
            console.log(`Processed ${count}/${sessions.length}`);
        }

        console.log('Backfill complete!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
