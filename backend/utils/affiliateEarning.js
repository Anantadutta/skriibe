const Creator = require('../models/Creator');
const Earning = require('../models/Earning');

async function processAffiliateEarning(creatorId, transactionId, orderNumber, totalCost, transactionType = 'chat') {
    if (!totalCost || totalCost <= 0) return;
    
    try {
        const creatorDoc = await Creator.findById(creatorId);
        if (creatorDoc && creatorDoc.referredBy) {
            // Check if already processed to prevent duplicates
            const existing = await Earning.findOne({ questionId: transactionId, earningType: 'affiliate_referral' });
            if (existing) return;

            let creatorSharePercent = 80;
            if (creatorDoc.commissionOverride && creatorDoc.commissionOverride.startDate) {
                const nowD = new Date();
                const start = new Date(creatorDoc.commissionOverride.startDate);
                const end = creatorDoc.commissionOverride.endDate ? new Date(creatorDoc.commissionOverride.endDate) : null;
                if (nowD >= start && (!end || nowD <= end)) {
                    creatorSharePercent = creatorDoc.commissionOverride.creatorShare || 80;
                }
            }
            
            const skriibeCutRatio = (100 - creatorSharePercent) / 100;
            const skriibeCut = totalCost * skriibeCutRatio;
            
            if (skriibeCut > 0) {
                const affiliateShareRs = skriibeCut * 0.25;
                if (affiliateShareRs > 0) {
                    await Creator.findByIdAndUpdate(creatorDoc.referredBy, {
                        $inc: { availableBalance: affiliateShareRs }
                    });
                    
                    await Earning.create({
                        creatorId: creatorDoc.referredBy,
                        creatorName: creatorDoc.referredByName || 'Affiliate Creator',
                        questionId: transactionId,
                        orderNumber: orderNumber,
                        amount: affiliateShareRs,
                        status: 'accumulating',
                        earningType: 'affiliate_referral'
                    });
                }
            }
        }
    } catch (err) {
        console.error('Failed to process affiliate earning:', err);
    }
}

module.exports = { processAffiliateEarning };
