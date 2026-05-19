/**
 * @file seedCreator.js
 * @description Seeds a demo creator for testing Phase 3 buyer flow.
 */

const mongoose = require('mongoose');
const Creator = require('../models/Creator');

const seedDemoCreator = async () => {
  try {
    console.log('🌱 Starting demo creator seed...');
    // Wait for mongoose to be connected
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => {
        mongoose.connection.once('open', resolve);
      });
    }
    
    const existing = await Creator.findOne({ handle: 'rahulfinance' });
    if (existing) {
      console.log('Demo creator already exists: @rahulfinance');
      return;
    }
    
    await Creator.create({
      phone: '9999999999',
      name: 'Rahul Finance',
      handle: 'rahulfinance',
      bio: 'Helping India save smarter. 5 yrs at HDFC. SIP, mutual funds, tax planning.',
      expertise: ['Finance', 'SIP', 'Mutual Funds'],
      instagramHandle: 'rahulfinance',
      price: 99,
      dailyCap: 50,
      ama_enabled: true,
      verified: true,
      replyRate: 94,
      avgReplyTime: 3.2,
      totalAnswered: 247,
      followers: 12,
    });
    console.log('✅ Demo creator seeded successfully: @rahulfinance');
  } catch (err) {
    console.error('❌ Seed error details:', err);
  }
};

module.exports = seedDemoCreator;
