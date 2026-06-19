const mongoose = require('mongoose');
const Question = require('../models/Question');
const Creator = require('../models/Creator');
const AdminAlert = require('../models/AdminAlert');
const { 
  sendStrikeWarningEmail, 
  sendStrikeSuspension48hEmail, 
  sendStrikeSuspension7dEmail, 
  sendStrikePermanentBanEmail 
} = require('../utils/emailService');

const runSlaMonitor = async () => {
  try {
    // 1. Find all breached questions
    const breachedQuestions = await Question.find({
      status: 'submitted',
      expiresAt: { $lt: new Date() }
    });

    for (const q of breachedQuestions) {
      // Mark as expired and refund
      q.status = 'expired';
      q.paymentStatus = 'refunded';
      q.adminDecision = 'fan_wins';
      await q.save();

      const creator = await Creator.findById(q.creatorId);
      if (!creator) continue;

      // 2. Evaluate Strikes & Decay
      const now = new Date();
      
      // Decay check: If now - mostRecentStrike.date > 90 days, all strikes expire
      const activeStrikes = creator.strikes.filter(s => !s.isExpired);
      let activeCount = activeStrikes.length;
      
      if (activeCount > 0) {
        // Sort strikes descending by date
        const sortedActive = [...activeStrikes].sort((a, b) => new Date(b.date) - new Date(a.date));
        const mostRecentStrike = sortedActive[0];
        const msPerDay = 1000 * 60 * 60 * 24;
        const daysSinceLastStrike = (now - new Date(mostRecentStrike.date)) / msPerDay;

        if (daysSinceLastStrike > 90) {
          // Decay triggers!
          creator.strikes.forEach(s => s.isExpired = true);
          activeCount = 0;
        }
      }

      // 3. Issue new strike
      let newLevel = activeCount + 1;
      if (newLevel > 4) newLevel = 4; // Cap at 4

      creator.strikes.push({
        strikeLevel: newLevel,
        date: now,
        reason: 'SLA breach',
        questionId: q._id,
        isExpired: false
      });

      // 4. Apply Actions
      if (newLevel === 1) {
        await sendStrikeWarningEmail(creator.email, creator.name);
      } else if (newLevel === 2) {
        creator.suspensionUntil = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        await sendStrikeSuspension48hEmail(creator.email, creator.name, creator.suspensionUntil);
      } else if (newLevel === 3) {
        creator.suspensionUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        creator.payoutsFrozenUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        await sendStrikeSuspension7dEmail(creator.email, creator.name, creator.suspensionUntil);
      } else if (newLevel >= 4) {
        creator.isBanned = true;
        creator.blacklisted = true;
        creator.pendingEarningsHoldUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        await sendStrikePermanentBanEmail(creator.email, creator.name);
      }

      await creator.save();

      // Create Admin Alert
      await AdminAlert.create({
        type: 'sla_breach',
        title: `SLA Breach - Strike ${newLevel}`,
        message: `Creator @${creator.handle} missed reply window for Q#${q._id.toString().slice(-6)}. Strike ${newLevel} issued.`,
        referenceId: creator._id
      });
      
      // Notify connected clients via Socket.IO
      if (global.io) {
        global.io.emit('question-status-changed', { creatorId: creator._id });
        global.io.emit('strike-issued', { creatorId: creator._id, level: newLevel });
      }
    }

    // 5. Separate sweep to decay ALL active strikes if 90 days have passed (even without a new breach)
    const creatorsWithActiveStrikes = await Creator.find({ 'strikes.isExpired': false });
    for (const creator of creatorsWithActiveStrikes) {
      const activeStrikes = creator.strikes.filter(s => !s.isExpired);
      if (activeStrikes.length > 0) {
        const sortedActive = [...activeStrikes].sort((a, b) => new Date(b.date) - new Date(a.date));
        const mostRecentStrike = sortedActive[0];
        const daysSinceLastStrike = (new Date() - new Date(mostRecentStrike.date)) / (1000 * 60 * 60 * 24);

        if (daysSinceLastStrike > 90) {
          creator.strikes.forEach(s => s.isExpired = true);
          await creator.save();
        }
      }
    }

    // 6. Release pending earnings hold for Strike 4 (banned) creators after 30 days
    const creatorsAwaitingPayout = await Creator.find({
      isBanned: true,
      pendingEarningsHoldUntil: { $lt: new Date() },
      earningsReleased: { $ne: true },
      payoutAlertSent: { $ne: true }
    });

    for (const creator of creatorsAwaitingPayout) {
      // Find all questions answered by this creator that are eligible for payout
      const validQuestions = await Question.find({
        creatorId: creator._id,
        status: { $in: ['answered', 'flagged'] },
        amountPaid: { $gt: 0 },
        answeredAt: { $ne: null },
        adminDecision: { $nin: ['fan_wins', 'banned'] }
      });

      let balanceToRelease = 0;
      for (const q of validQuestions) {
        balanceToRelease += (q.amountPaid * 0.80); // 80% creator share
      }

      creator.payoutAlertSent = true;
      await creator.save();

      await AdminAlert.create({
        type: 'payout_ready',
        title: 'Banned Creator Payout Ready',
        message: `30-day earnings hold expired for banned creator @${creator.handle}. Balance to manually transfer: ₹${balanceToRelease.toFixed(2)} (after disputes).`,
        referenceId: creator._id
      });
    }

  } catch (err) {
    console.error('SLA Monitor Error:', err);
  }
};

const initSlaMonitor = () => {
  // Run every 5 minutes
  setInterval(runSlaMonitor, 5 * 60 * 1000);
  console.log('SLA Monitor initialized');
};

module.exports = { initSlaMonitor, runSlaMonitor };
