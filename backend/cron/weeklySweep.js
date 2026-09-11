const mongoose = require('mongoose');
const Creator = require('../models/Creator');
const SweepLog = require('../models/SweepLog');
const Question = require('../models/Question');
const Earning = require('../models/Earning');
const ChatSession = require('../models/ChatSession');
const WalletTransaction = require('../models/WalletTransaction');

// Helper to calculate Tuesday 00:00:00 IST for any given date
const getTuesday00IST = (d = new Date()) => {
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(d.getTime() + istOffset);
    const day = istTime.getUTCDay();
    const diffDays = (day - 2 + 7) % 7;
    const tuesdayIST = new Date(istTime);
    tuesdayIST.setUTCDate(tuesdayIST.getUTCDate() - diffDays);
    tuesdayIST.setUTCHours(0, 0, 0, 0);
    return new Date(tuesdayIST.getTime() - istOffset);
};

const runWeeklySweep = async (forceNow = false) => {
    console.log(`Starting weekly sweep of balances (forceNow: ${forceNow})...`);
    try {
        const now = new Date();
        let cycleEnd;
        let cycleStart;

        if (forceNow) {
            cycleEnd = now;
            cycleStart = getTuesday00IST(now);
        } else {
            cycleEnd = getTuesday00IST(now);
            cycleStart = new Date(cycleEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        // Find all active creators
        const creators = await Creator.find({
            isBanned: { $ne: true }
        }).select('_id commissionOverride availableBalance lifetimePaid');

        let sweptCount = 0;
        let totalSweptAmount = 0;

        for (const c of creators) {
            // Check if sweep for this Tuesday cycle has already been logged
            const existingLog = await SweepLog.findOne({
                creatorId: c._id,
                $or: [
                    { weekStart: cycleStart },
                    { sweptAt: { $gte: new Date(cycleEnd.getTime() - 3600000), $lte: new Date(cycleEnd.getTime() + 3600000) } }
                ]
            });

            if (existingLog && !forceNow) {
                continue; // Already swept this cycle
            }

            const getCreatorShare = (date) => {
                let share = 0.8;
                if (c.commissionOverride && c.commissionOverride.startDate) {
                    const qDate = new Date(date);
                    const start = new Date(c.commissionOverride.startDate);
                    const end = c.commissionOverride.endDate ? new Date(c.commissionOverride.endDate) : null;
                    start.setHours(0, 0, 0, 0);
                    if (end) end.setHours(23, 59, 59, 999);
                    if (qDate >= start && (!end || qDate <= end)) {
                        share = (c.commissionOverride.creatorShare || 80) / 100;
                    }
                }
                return share;
            };

            let weeklyTotal = 0;
            let weeklyTxCount = 0;

            // 1. Answered questions in [cycleStart, cycleEnd)
            const answeredQuestions = await Question.find({
                creatorId: c._id,
                status: { $in: ['answered', 'satisfied'] },
                $or: [
                    { answeredAt: { $gte: cycleStart, $lt: cycleEnd } },
                    { answeredAt: null, createdAt: { $gte: cycleStart, $lt: cycleEnd } }
                ]
            }).select('amountPaid answeredAt createdAt');

            for (const q of answeredQuestions) {
                const gross = q.amountPaid || 0;
                if (gross > 0) {
                    const qDate = q.answeredAt || q.createdAt || now;
                    weeklyTotal += gross * getCreatorShare(qDate);
                    weeklyTxCount++;
                }
            }

            // 2. Affiliate earnings in [cycleStart, cycleEnd)
            const affEarnings = await Earning.find({
                creatorId: c._id,
                earningType: 'affiliate_referral',
                createdAt: { $gte: cycleStart, $lt: cycleEnd }
            }).select('amount');

            for (const a of affEarnings) {
                weeklyTotal += (a.amount || 0);
                weeklyTxCount++;
            }

            // 3. Live chat sessions ended in [cycleStart, cycleEnd)
            const liveChats = await ChatSession.find({
                creatorId: c._id,
                status: 'ended',
                $or: [
                    { endTime: { $gte: cycleStart, $lt: cycleEnd } },
                    { startTime: { $gte: cycleStart, $lt: cycleEnd } }
                ]
            }).select('totalCost endTime startTime');

            for (const chat of liveChats) {
                const gross = chat.totalCost || 0;
                if (gross > 0) {
                    const chatDate = chat.endTime || chat.startTime || now;
                    weeklyTotal += gross * getCreatorShare(chatDate);
                    weeklyTxCount++;
                }
            }

            // 4. Tips in [cycleStart, cycleEnd)
            const tips = await WalletTransaction.find({
                creatorId: c._id,
                type: 'debit',
                description: 'Tip sent',
                createdAt: { $gte: cycleStart, $lt: cycleEnd }
            }).select('amount createdAt');

            for (const tip of tips) {
                const gross = tip.amount || 0;
                if (gross > 0) {
                    weeklyTotal += gross * getCreatorShare(tip.createdAt);
                    weeklyTxCount++;
                }
            }

            // Also check if creator had availableBalance
            if (c.availableBalance > 0 && weeklyTotal === 0) {
                weeklyTotal = c.availableBalance;
                weeklyTxCount = weeklyTxCount || 1;
            }

            if (weeklyTotal > 0) {
                const roundedAmount = Math.round(weeklyTotal * 100) / 100;

                await SweepLog.create({
                    creatorId: c._id,
                    amountSwept: roundedAmount,
                    sweptAt: cycleEnd,
                    weekStart: cycleStart,
                    weekEnd: cycleEnd,
                    status: 'Processed',
                    transactionCount: weeklyTxCount
                });

                await Creator.updateOne(
                    { _id: c._id },
                    {
                        $set: { availableBalance: 0 },
                        $inc: { lifetimePaid: roundedAmount }
                    }
                );

                try {
                    await Earning.updateMany(
                        { creatorId: c._id, status: 'accumulating', createdAt: { $lt: cycleEnd } },
                        { $set: { status: 'swept' } }
                    );
                } catch (eErr) {
                    console.error('Error updating earning status:', eErr);
                }

                sweptCount++;
                totalSweptAmount += roundedAmount;
            }
        }

        console.log(`Weekly sweep complete. Swept ${sweptCount} creators for a total of ₹${totalSweptAmount}.`);
    } catch (error) {
        console.error('Error during weekly sweep:', error);
    }
};

const initWeeklySweep = () => {
    let lastRunDate = null;
    
    // Check every minute
    setInterval(() => {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(now.getTime() + istOffset);
        
        // If it's Tuesday (day 2) and the hour is 0 (midnight IST)
        if (istDate.getUTCDay() === 2 && istDate.getUTCHours() === 0) {
            const dateStr = istDate.toISOString().split('T')[0]; // YYYY-MM-DD
            if (lastRunDate !== dateStr) {
                lastRunDate = dateStr;
                runWeeklySweep(false);
            }
        }
    }, 60 * 1000);
    
    console.log('Weekly Sweep Monitor initialized (runs Tuesdays at 00:00 IST)');
};

module.exports = { initWeeklySweep, runWeeklySweep };
