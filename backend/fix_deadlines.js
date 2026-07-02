require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');

async function fixDeadlines() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const questions = await Question.find({ status: 'submitted' });
    console.log(`Found ${questions.length} submitted questions.`);

    let updatedCount = 0;
    for (const q of questions) {
      const newDeadline = new Date(q.createdAt.getTime() + 24 * 60 * 60 * 1000);
      
      // Only update if it actually changes it significantly, or just force update all
      console.log(`Updating Question ${q._id}:`);
      console.log(`  Created: ${q.createdAt}`);
      console.log(`  Old Deadline: ${q.expiresAt}`);
      console.log(`  New Deadline: ${newDeadline}`);
      
      q.expiresAt = newDeadline;
      await q.save();
      updatedCount++;
    }

    console.log(`Successfully updated ${updatedCount} questions to have a strict 24-hour deadline.`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixDeadlines();
