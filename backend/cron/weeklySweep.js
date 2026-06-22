const mongoose = require('mongoose');
const Creator = require('../models/Creator');
const SweepLog = require('../models/SweepLog');

const runWeeklySweep = async () => {
    console.log('Starting weekly sweep of available balances...');
    try {
        // Find all creators who have an availableBalance > 0
        const creatorsWithBalance = await Creator.find({ availableBalance: { $gt: 0 } }).select('_id');
        
        let sweptCount = 0;
        let totalSweptAmount = 0;

        for (const c of creatorsWithBalance) {
            // Use an aggregation pipeline in findOneAndUpdate for a single, fully atomic transaction
            // that updates both fields simultaneously.
            const preUpdateCreator = await Creator.findOneAndUpdate(
                { _id: c._id, availableBalance: { $gt: 0 } },
                [
                    { 
                        $set: { 
                            lifetimePaid: { $add: [{ $ifNull: ["$lifetimePaid", 0] }, "$availableBalance"] },
                            availableBalance: 0 
                        } 
                    }
                ],
                { new: false } // Return the document as it was BEFORE the update so we know how much was swept
            );

            // If preUpdateCreator is null, it means the balance was already 0 (maybe another instance swept it)
            if (preUpdateCreator && preUpdateCreator.availableBalance > 0) {
                const amountToSweep = preUpdateCreator.availableBalance;

                // Create audit log
                await SweepLog.create({
                    creatorId: c._id,
                    amountSwept: amountToSweep
                });

                // Update ledger status
                try {
                    const Earning = require('../models/Earning');
                    await Earning.updateMany(
                        { creatorId: c._id, status: 'accumulating' },
                        { $set: { status: 'swept' } }
                    );
                } catch (earningErr) {
                    console.error('Failed to update earning status during sweep:', earningErr);
                }

                sweptCount++;
                totalSweptAmount += amountToSweep;
            }
        }
        
        console.log(`Weekly sweep complete. Swept ${sweptCount} creators for a total of ${totalSweptAmount} INR.`);
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
                runWeeklySweep();
            }
        }
    }, 60 * 1000);
    
    console.log('Weekly Sweep Monitor initialized (runs Tuesdays at 00:00 IST)');
};

module.exports = { initWeeklySweep, runWeeklySweep };
