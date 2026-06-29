const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Creator = require('../models/Creator');
const Fan = require('../models/Fan');
const Question = require('../models/Question');
const DeletedAccountReason = require('../models/DeletedAccountReason');
const AdminAlert = require('../models/AdminAlert');

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGO_URI);
};

/**
 * @route GET /api/admin/dashboard
 * @desc Get aggregated dashboard metrics (Platform pulse)
 */
router.get('/dashboard', async (req, res) => {
  try {
    await connectDB();

    let startOfDay, endOfDay;
    
    if (req.query.startDate && req.query.endDate) {
      startOfDay = new Date(req.query.startDate);
      startOfDay.setHours(0, 0, 0, 0);
      endOfDay = new Date(req.query.endDate);
      endOfDay.setHours(23, 59, 59, 999);
    } else {
      startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
    }

    const slaLimit = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // Calculate total open questions irrespective of time
    const openQuestionsCount = await Question.countDocuments({
      status: 'submitted',
      paymentStatus: 'paid'
    });

    // Calculate actual SLA breaches: pending for > 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const breachedQuestions = await Question.find({
      status: 'submitted',
      paymentStatus: 'paid',
      createdAt: { $lt: last24Hours }
    }).populate('creatorId', 'name handle').populate('fanId', 'name email');
    const slaBreachesCount = breachedQuestions.length;

    // Active creators
    const activeCreatorsCount = await Creator.countDocuments({ isLive: true });

    // Financials: Count all questions that have been paid within the date range
    const todayQuestions = await Question.find({
      paymentStatus: 'paid',
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
    const creatorIds = [...new Set(todayQuestions.map(q => q.creatorId.toString()))];
    const creators = await Creator.find({ _id: { $in: creatorIds } });
    const creatorMap = {};
    creators.forEach(c => creatorMap[c._id.toString()] = c);

    let gmvToday = 0;
    let revenue = 0;
    const now = new Date();

    todayQuestions.forEach(q => {
      const amount = q.isFollowUp ? 0 : (q.amountPaid || q.price || 0);
      gmvToday += amount;

      const creator = creatorMap[q.creatorId.toString()];
      let creatorSharePercentage = 0.8; // default 80% creator, 20% skriibe

      if (creator && creator.commissionOverride && creator.commissionOverride.startDate) {
        const start = new Date(creator.commissionOverride.startDate);
        const end = creator.commissionOverride.endDate ? new Date(creator.commissionOverride.endDate) : null;
        start.setHours(0,0,0,0);
        if (end) end.setHours(23,59,59,999);
        const qDate = new Date(q.createdAt);
        
        if (qDate >= start && (!end || qDate <= end)) {
          creatorSharePercentage = creator.commissionOverride.creatorShare / 100;
        }
      }

      const skriibeSharePercentage = Math.max(0, 1.0 - creatorSharePercentage);
      revenue += (amount * skriibeSharePercentage);
    });

    gmvToday = Math.round(gmvToday);
    revenue = Math.round(revenue);

    const dashboardData = {
      gmvToday: gmvToday,
      revenue: revenue,
      activeCreators: activeCreatorsCount || await Creator.countDocuments(), // Fallback to all if none live
      slaBreaches: slaBreachesCount,
      breachedQuestions: breachedQuestions,
      actionMetrics: {
        openQuestions: openQuestionsCount,
        refundsToday: 0 // Placeholder or calculate if there is refund logic
      },
      recentActivity: [
        { id: 1, text: 'Auto-refund triggered · Q#1234 · SLA breach · 2 min ago' },
        { id: 2, text: '@priya_fit verified and activated · 5 min ago' },
        { id: 3, text: 'New creator signup · @rohan_biz · pending review' },
        { id: 4, text: 'Dispute #1235 resolved by admin · 12 min ago' }
      ]
    };

    res.json(dashboardData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching dashboard' });
  }
});

/**
 * @route GET /api/admin/transactions
 * @desc Get all transactions (questions and nested follow-ups)
 */
router.get('/transactions', async (req, res) => {
  try {
    const questions = await Question.find({})
      .populate('creatorId', 'name handle avatarUrl')
      .populate('fanId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    const parentQuestions = questions.filter(q => !q.isFollowUp);
    const followUps = questions.filter(q => q.isFollowUp);

    // Group follow-ups under parents
    parentQuestions.forEach(pq => {
      pq.followUps = followUps.filter(fq => String(fq.parentQuestionId) === String(pq._id));
    });

    res.json(parentQuestions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching transactions' });
  }
});

/**
 * @route GET /api/admin/account-actions
 * @desc Get all account deletion and pause logs
 */
router.get('/account-actions', async (req, res) => {
  try {
    const AccountActionLog = require('../models/AccountActionLog');
    const logs = await AccountActionLog.find({}).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching account actions' });
  }
});

/**
 * @route GET /api/admin/verification-queue
 * @desc Get verification queue list
 */
router.get('/verification-queue', (req, res) => {
  try {
    // Mock queue matching Image 2
    const queue = [
      {
        id: '1',
        username: '@rahulfinance',
        followers: '12K',
        panStatus: 'PAN OK',
        age: '3mo',
        igLinked: true
      },
      {
        id: '2',
        username: '@priya_startup',
        followers: '3.2K',
        panStatus: 'PAN pending',
        age: '1mo',
        igLinked: false
      },
      {
        id: '3',
        username: '@rohan_money',
        followers: '28K',
        panStatus: 'PAN OK',
        age: '8mo',
        igLinked: true
      }
    ];

    res.json(queue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching queue' });
  }
});

/**
 * @route GET /api/admin/creators
 * @desc Get all creators with calculated health stats
 */
router.get('/creators', async (req, res) => {
  try {
    await connectDB();
    const creators = await Creator.find({}).sort({ createdAt: -1 }).lean();
    const Question = require('../models/Question');

    // Calculate stats for each creator
    const creatorsWithStats = await Promise.all(creators.map(async (creator) => {
      const questions = await Question.find({ creatorId: creator._id });
      
      const totalQuestions = questions.length;
      let answered = 0;
      let refunds = 0;
      let slaBreaches = 0;
      let totalResponseTimeMs = 0;

      let pendingCount = 0;
      let disputeCount = 0;
      let answeredForTime = 0;

      questions.forEach(q => {
        if (q.status === 'pending') pendingCount++;
        if (q.status === 'flagged') disputeCount++;
        if (['answered', 'satisfied', 'rejected'].includes(q.status)) {
          answered++;
          if (q.createdAt && q.answeredAt) {
            totalResponseTimeMs += (new Date(q.answeredAt) - new Date(q.createdAt));
            answeredForTime++;
          }
        }
        if (q.status === 'rejected' || q.status === 'refunded' || q.adminDecision === 'fan_wins') refunds++;
        if (q.status === 'expired' || (q.answeredAt && q.expiresAt && q.answeredAt > q.expiresAt)) slaBreaches++;
      });

      const denominator = totalQuestions - pendingCount - disputeCount;
      const replyRate = denominator > 0 ? Math.round((answered / denominator) * 100) : 0;
      const refundRate = totalQuestions > 0 ? Math.round((refunds / totalQuestions) * 100) : 0;
      const avgResponseTimeMins = answeredForTime > 0 ? Math.round((totalResponseTimeMs / answeredForTime) / 60000) : 0;

      let activeStrikesCount = 0;
      if (creator.strikes && creator.strikes.length > 0) {
        const activeStrikes = creator.strikes.filter(s => !s.isExpired);
        if (activeStrikes.length > 0) {
          const sortedActive = [...activeStrikes].sort((a, b) => new Date(b.date) - new Date(a.date));
          const mostRecentStrike = sortedActive[0];
          const daysSinceLastStrike = (new Date() - new Date(mostRecentStrike.date)) / (1000 * 60 * 60 * 24);
          if (daysSinceLastStrike <= 90) {
             activeStrikesCount = activeStrikes.length;
          }
        }
      }

      let healthStatus = 'Account Healthy';
      if (creator.isBanned) {
         healthStatus = 'Permanently Removed';
      } else if (activeStrikesCount === 3) {
         healthStatus = '3 — Suspended (7 Days)';
      } else if (activeStrikesCount === 2) {
         healthStatus = '2 — Warning & Review';
      }

      return {
        ...creator,
        activeStrikesCount,
        calculatedStats: {
          replyRate,
          refundRate,
          slaBreaches,
          avgResponseTimeMins,
          answered,
          healthStatus
        }
      };
    }));

    res.json(creatorsWithStats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching creators' });
  }
});

// Helper for manual admin strike creation
const issueManualStrike = async (creatorId, minLevel) => {
  const Creator = require('../models/Creator');
  const { sendStrikeWarningEmail, sendStrikeSuspension48hEmail, sendBan7DaysEmail, sendBanPermanentEmail } = require('../utils/emailService');
  const creator = await Creator.findById(creatorId);
  if (!creator || creator.isBanned) return null;

  const now = new Date();
  const activeStrikes = creator.strikes.filter(s => !s.isExpired);
  let activeCount = activeStrikes.length;
  
  if (activeCount > 0) {
    const sortedActive = [...activeStrikes].sort((a, b) => new Date(b.date) - new Date(a.date));
    const mostRecentStrike = sortedActive[0];
    const daysSinceLastStrike = (now - new Date(mostRecentStrike.date)) / (1000 * 60 * 60 * 24);
    if (daysSinceLastStrike > 90) {
      creator.strikes.forEach(s => s.isExpired = true);
      activeCount = 0;
    }
  }

  let newLevel = activeCount + 1;
  if (newLevel > 4) newLevel = 4;

  creator.strikes.push({
    strikeLevel: newLevel,
    date: now,
    reason: 'manual_admin_action',
    isExpired: false
  });

  if (newLevel === 1) {
    await sendStrikeWarningEmail(creator.email, creator.name);
  } else if (newLevel === 2) {
    creator.suspensionUntil = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    await sendStrikeSuspension48hEmail(creator.email, creator.name);
  } else if (newLevel === 3) {
    creator.suspensionUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    creator.payoutsFrozenUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    await sendBan7DaysEmail(creator.email, creator.name, creator.suspensionUntil);
  } else if (newLevel >= 4) {
    creator.isBanned = true;
    creator.blacklisted = true;
    creator.pendingEarningsHoldUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    await sendBanPermanentEmail(creator.email, creator.name);
  }
  await creator.save();
  return creator;
};

/**
 * @route POST /api/admin/creators/:id/warn
 */
router.post('/creators/:id/warn', async (req, res) => {
  try {
    await connectDB();
    const creator = await issueManualStrike(req.params.id);
    if (!creator) return res.status(404).json({ error: 'Creator not found or banned' });
    res.json({ success: true, message: 'Warning issued.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route POST /api/admin/creators/:id/suspend
 */
router.post('/creators/:id/suspend', async (req, res) => {
  try {
    await connectDB();
    const creator = await issueManualStrike(req.params.id);
    if (!creator) return res.status(404).json({ error: 'Creator not found or banned' });
    res.json({ success: true, message: 'Suspension issued.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/creators/:id/mark-paid', async (req, res) => {
  try {
    await connectDB();
    const Creator = require('../models/Creator');
    const creator = await Creator.findById(req.params.id);
    if (!creator) return res.status(404).json({ error: 'Creator not found' });
    
    creator.earningsReleased = true;
    await creator.save();

    // Optionally dismiss related admin alerts
    const AdminAlert = require('../models/AdminAlert');
    await AdminAlert.updateMany(
      { referenceId: creator._id, type: 'payout_ready', isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true, message: 'Earnings marked as paid.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route GET /api/admin/fans
 * @desc Get all fans
 */
router.get('/fans', async (req, res) => {
  try {
    await connectDB();
    const fans = await Fan.find({}).sort({ createdAt: -1 }).lean();
    
    const fansWithStats = await Promise.all(fans.map(async (fan) => {
      // paymentStatus: 'paid' implies it was actually asked, but let's count all questions linked to them
      const totalQuestionsAsked = await Question.countDocuments({ fanId: fan._id });
      return { ...fan, totalQuestionsAsked };
    }));
    
    res.json(fansWithStats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching fans' });
  }
});

/**
 * @route GET /api/admin/open-questions
 * @desc Get all open (submitted) questions
 */
router.get('/open-questions', async (req, res) => {
  try {
    await connectDB();
    const slaLimit = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const openQuestions = await Question.find({ 
      status: 'submitted', 
      paymentStatus: 'paid',
      createdAt: { $gte: slaLimit }
    })
      .populate('creatorId', 'name handle avatarUrl email')
      .sort({ createdAt: 1 }); // Oldest first
    res.json(openQuestions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.toString(), stack: err.stack });
  }
});

/**
 * @route GET /api/admin/buyer-disputes
 * @desc Get all flagged questions
 */
router.get('/buyer-disputes', async (req, res) => {
  try {
    await connectDB();
    const disputes = await Question.find({ status: 'flagged' })
      .populate('creatorId', 'name handle avatarUrl email')
      .sort({ updatedAt: -1 }); // Recently flagged first

    for (let d of disputes) {
      if (d.isBuyerBanned && (!d.adminDecision || d.adminDecision === 'pending')) {
        d.adminDecision = 'banned';
        await d.save();
      }
    }

    res.json(disputes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching disputes' });
  }
});

/**
 * @route GET /api/admin/dispute/:id
 * @desc Get a single flagged question
 */
router.get('/dispute/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await connectDB();
    const dispute = await Question.findById(id).populate('creatorId', 'name handle avatarUrl email price');
    if (!dispute) return res.status(404).json({ error: 'Dispute not found' });
    res.json(dispute);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching dispute' });
  }
});

/**
 * @route GET /api/admin/creator-disputes
 * @desc Get all questions rejected or flagged by creators
 */
router.get('/creator-disputes', async (req, res) => {
  try {
    await connectDB();
    const disputes = await Question.find({ status: 'rejected' })
      .populate('creatorId', 'name handle avatarUrl email')
      .sort({ updatedAt: -1 });
    res.json(disputes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching creator disputes' });
  }
});

/**
 * @route POST /api/admin/creator-disputes/:id/resolve
 * @desc Resolve a creator dispute with admin notes
 */
router.post('/creator-disputes/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, notes, banType } = req.body;
    
    const updateData = { adminNotes: notes || '' };
    if (decision) updateData.adminDecision = decision;

    await connectDB();
    const dispute = await Question.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate('creatorId', 'name email');
    
    if (!dispute) return res.status(404).json({ error: 'Dispute not found' });

    // Handle fan banning for abusive questions
    if (decision === 'abusive' && banType) {
      const Fan = require('../models/Fan');
      const fan = await Fan.findById(dispute.fanId);
      if (fan) {
        const { sendFanSuspensionEmail, sendFanPermanentBanEmail } = require('../utils/emailService');
        if (banType === 'permanent') {
          fan.isBanned = true;
          await fan.save();
          await sendFanPermanentBanEmail(fan.email, fan.name || 'Fan');
        } else if (banType === '7_days' && !fan.isBanned) {
          // If already permanently banned, do not downgrade
          const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          fan.banExpiresAt = endDate;
          await fan.save();
          const formattedEndDate = endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          await sendFanSuspensionEmail(fan.email, fan.name || 'Fan', formattedEndDate);
        }
        
      }
    }

    res.json({ success: true, dispute });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error resolving dispute' });
  }
});

/**
 * @route GET /api/admin/alerts
 * @desc Get all admin alerts/notifications
 */
router.get('/alerts', async (req, res) => {
  try {
    await connectDB();
    const AdminAlert = require('../models/AdminAlert');
    const Question = require('../models/Question');
    const Creator = require('../models/Creator');
    const Fan = require('../models/Fan');

    let alerts = await AdminAlert.find().sort({ createdAt: -1 });

    // Dynamically backfill/sync alerts for old data that might have missed the trigger
    const disputes = await Question.find({ status: { $in: ['rejected', 'flagged'] } });
    for (const d of disputes) {
      if (d.status === 'rejected') {
        await AdminAlert.updateOne(
          { referenceId: d._id, type: { $in: ['creator_reject', 'creator_flag'] } },
          { 
            $setOnInsert: { 
              type: d.rejectReason === 'abuse' ? 'creator_flag' : 'creator_reject',
              title: d.rejectReason === 'abuse' ? 'Creator flagged abuse' : 'Creator rejected question',
              message: `Creator rejected question #${d.disputeId || d._id.toString().slice(-6)}: ${d.rejectReason || 'expertise'}`,
              referenceId: d._id,
              createdAt: d.updatedAt
            }
          },
          { upsert: true }
        );
      } else if (d.status === 'flagged') {
        await AdminAlert.updateOne(
          { referenceId: d._id, type: 'buyer_flag' },
          {
            $setOnInsert: {
              type: 'buyer_flag',
              title: 'Buyer flagged a reply',
              message: `Buyer flagged reply for question #${d.disputeId || d._id.toString().slice(-6)}`,
              referenceId: d._id,
              createdAt: d.updatedAt
            }
          },
          { upsert: true }
        );
      }
    }
      
    // Fetch latest alerts after sync
    alerts = await AdminAlert.find().sort({ createdAt: -1 });

    res.json(alerts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching alerts' });
  }
});

/**
 * @route POST /api/admin/creators/:id/commission
 * @desc Set a time-bound commission override for a creator
 */
router.post('/creators/:id/commission', async (req, res) => {
  try {
    const { id } = req.params;
    const { creatorShare, startDate, endDate } = req.body;
    
    await connectDB();
    const creator = await Creator.findById(id);
    if (!creator) return res.status(404).json({ error: 'Creator not found' });

    creator.commissionOverride = {
      creatorShare: parseFloat(creatorShare),
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    };
    
    await creator.save();
    
    res.json({ success: true, message: 'Commission override saved successfully', creator });
  } catch (err) {
    console.error('Commission override error:', err.message, err.stack);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

/**
 * @route POST /api/admin/alerts/mark-read
 * @desc Mark alerts as read
 */
router.post('/alerts/mark-read', async (req, res) => {
  try {
    await connectDB();
    // If no IDs provided, mark all as read
    if (!req.body.ids || req.body.ids.length === 0) {
      await AdminAlert.updateMany({ isRead: false }, { isRead: true });
    } else {
      await AdminAlert.updateMany({ _id: { $in: req.body.ids } }, { isRead: true });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error marking alerts read' });
  }
});

router.get('/debug-db', async (req, res) => {
  try {
    await connectDB();
    const allQuestions = await Question.find({});
    res.json({ count: allQuestions.length, data: allQuestions });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

/**
 * @route DELETE /api/admin/buyer-disputes/:id
 * @desc Soft delete a dispute so it moves to resolved
 */
router.delete('/buyer-disputes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await connectDB();
    const dispute = await Question.findById(id);
    if (!dispute) return res.status(404).json({ error: 'Dispute not found' });
    dispute.adminDecision = 'deleted';
    await dispute.save();
    res.json({ success: true, message: 'Dispute marked as deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Server error deleting dispute: ' + err.message });
  }
});

/**
 * @route POST /api/admin/buyer-disputes/:id/resolve
 * @desc Resolve a buyer dispute with admin notes and decision
 */
router.post('/buyer-disputes/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, notes } = req.body;

    const updateData = { adminNotes: notes || '' };
    if (decision) updateData.adminDecision = decision;

    await connectDB();
    const dispute = await Question.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
    
    if (!dispute) return res.status(404).json({ error: 'Dispute not found' });
    
    res.json({ success: true, message: 'Dispute resolved successfully' });
  } catch (err) {
    console.error('Error resolving dispute:', err);
    res.status(500).json({ error: 'Server error resolving dispute: ' + err.message });
  }
});

/**
 * @route POST /api/admin/buyer-disputes/:id/refund
 * @desc Refund the buyer and resolve dispute
 */
router.post('/buyer-disputes/:id/refund', async (req, res) => {
  try {
    const { id } = req.params;
    await connectDB();
    const dispute = await Question.findById(id);
    if (!dispute) return res.status(404).json({ error: 'Dispute not found' });
    dispute.adminDecision = 'fan_wins';
    await dispute.save();
    res.json({ success: true, message: 'Refund issued' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route POST /api/admin/buyer-disputes/:id/dismiss
 * @desc Dismiss dispute in favor of creator
 */
router.post('/buyer-disputes/:id/dismiss', async (req, res) => {
  try {
    const { id } = req.params;
    await connectDB();
    const dispute = await Question.findById(id);
    if (!dispute) return res.status(404).json({ error: 'Dispute not found' });
    dispute.adminDecision = 'creator_wins';
    await dispute.save();
    res.json({ success: true, message: 'Dispute dismissed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route POST /api/admin/buyer-disputes/:id/ban
 * @desc Ban the buyer who initiated the dispute
 */
router.post('/buyer-disputes/:id/ban', async (req, res) => {
  try {
    const { id } = req.params;
    const { duration } = req.body;
    await connectDB();
    const Question = require('../models/Question');
    const Fan = require('../models/Fan');

    const dispute = await Question.findById(id);
    if (!dispute) return res.status(404).json({ error: 'Dispute not found' });

    let fan = null;
    if (dispute.fanId) {
      fan = await Fan.findById(dispute.fanId);
    } else if (dispute.buyerEmail) {
      fan = await Fan.findOne({ email: dispute.buyerEmail.toLowerCase() });
    }

    let banExpiresAt = null;
    if (duration === '7days') {
      banExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    if (!fan) {
      let dummyEmail = dispute.buyerEmail || (dispute.buyerPhone ? `${dispute.buyerPhone}@banned.skriibe.com` : `anon_${Date.now()}@banned.skriibe.com`);
      fan = await Fan.findOne({ email: dummyEmail.toLowerCase() });
      if (!fan) {
        fan = new Fan({
          email: dummyEmail.toLowerCase(),
          name: dispute.buyerName || 'Banned Buyer',
          password: 'banned_stub_account',
          isBanned: true,
          banExpiresAt
        });
      } else {
        fan.isBanned = true;
        fan.banExpiresAt = banExpiresAt;
      }
    } else {
      fan.isBanned = true;
      fan.banExpiresAt = banExpiresAt;
    }

    const { sendBan7DaysEmail, sendBanPermanentEmail } = require('../utils/emailService');

    await fan.save();
    
    dispute.isBuyerBanned = true;
    dispute.adminDecision = 'banned';
    await dispute.save();

    if (duration === '7days' && fan.email) {
      await sendBan7DaysEmail(fan.email, fan.name, banExpiresAt);
    } else if (duration === 'permanent' && fan.email) {
      await sendBanPermanentEmail(fan.email, fan.name);
    }

    res.json({ success: true, message: `Buyer banned successfully${duration === '7days' ? ' for 7 days' : ''}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error banning buyer' });
  }
});

/**
 * @route GET /api/admin/earnings
 * @desc Get daily earnings ledger
 */
router.get('/earnings', async (req, res) => {
  try {
    await connectDB();
    const Earning = require('../models/Earning');
    const { creatorId, status } = req.query;
    
    let query = {};
    if (creatorId) query.creatorId = creatorId;
    if (status) query.status = status;
    
    const earnings = await Earning.find(query).sort({ date: -1 });
    res.json({ success: true, earnings });
  } catch (err) {
    console.error('Error fetching earnings:', err);
    res.status(500).json({ error: 'Server error fetching earnings' });
  }
});

module.exports = router;
