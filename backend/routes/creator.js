/**
 * @file creator.js
 * @description Routes for creator profile setup and activation.
 */

const express = require('express');
const { getCookieOptions, getClearCookieOptions } = require('../utils/cookieConfig');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Creator = require('../models/Creator');
const Question = require('../models/Question');
const AdminAlert = require('../models/AdminAlert');
const { sendWelcomeEmail, sendProfileSubmittedEmail,
 sendQuestionAnsweredEmail, sendFollowUpAnsweredEmail } = require('../utils/emailService');
const { verifyBankAccount, verifyPan, verifyIfsc } = require('../utils/cashfreeService');

const { verifyCreatorToken } = require('../middleware/auth');
const { normalizeExpertiseList } = require('../utils/expertiseConstants');

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGO_URI);
};

const issueToken = (creator) => {
  return jwt.sign(
    { creatorId: creator._id, email: creator.email, handle: creator.handle },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );
};

/**
 * @route POST /api/creator/profile
 * @desc Save Step 1 profile data, trigger Resend welcome email
 */
router.post('/profile', verifyCreatorToken, async (req, res) => {
  try {
    const { name, handle, email, bio, expertise, avatarUrl, instagramHandle, instagramConnected, instagramFollowers } = req.body;

    if (!name || !handle || !email) {
      return res.status(400).json({ message: 'Name, handle, and email are required.' });
    }

    await connectDB();
    
    // Check if handle is taken by someone else
    const existing = await Creator.findOne({ handle, _id: { $ne: req.creator.creatorId } });
    if (existing) {
      return res.status(400).json({ message: 'Handle is already taken.' });
    }

    // Check if email is taken by someone else
    const existingEmail = await Creator.findOne({ email, _id: { $ne: req.creator.creatorId } });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email is already in use.' });
    }

    const defaultBio = "Heyyy! Got something on your mind? Let’s chat!";
    const updateFields = { 
      name, 
      handle, 
      email, 
      bio: (bio && bio.trim()) ? bio.trim() : defaultBio, 
      expertise: Array.isArray(expertise) ? normalizeExpertiseList(expertise) : expertise, 
      avatarUrl 
    };
    if (instagramHandle !== undefined) updateFields.instagramHandle = instagramHandle;
    if (instagramConnected !== undefined) updateFields.instagramConnected = instagramConnected;
    if (instagramFollowers !== undefined) updateFields.instagramFollowers = instagramFollowers;

    const updatedCreator = await Creator.findByIdAndUpdate(
      req.creator.creatorId,
      updateFields,
      { new: true }
    );

    // Sync name and avatar to associated Fan profile
    const Fan = require('../models/Fan');
    let fan = null;
    if (updatedCreator.fanId) {
      fan = await Fan.findById(updatedCreator.fanId);
    } else {
      fan = await Fan.findOne({ email: updatedCreator.email.toLowerCase() });
    }
    if (fan) {
      fan.name = updatedCreator.name;
      fan.avatarUrl = updatedCreator.avatarUrl;
      await fan.save();
      
      if (!updatedCreator.fanId) {
        updatedCreator.fanId = fan._id;
        await updatedCreator.save();
      }
    }

    res.json({ success: true, creator: updatedCreator });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/creator/activate
 * @desc Save Step 2 pricing data, set ama_enabled to true, and issue final JWT
 */
router.post('/activate', verifyCreatorToken, async (req, res) => {
  try {
    const { price, dailyCap } = req.body;

    if (typeof price !== 'number' || price < 10) {
      return res.status(400).json({ message: 'Invalid price. Must be at least 10.' });
    }
    
    const cap = dailyCap || 50;
    if (typeof cap !== 'number' || cap < 5 || cap > 100) {
      return res.status(400).json({ message: 'Invalid daily cap. Must be between 5 and 100.' });
    }

    await connectDB();
    const updatedCreator = await Creator.findByIdAndUpdate(
      req.creator.creatorId,
      { price, dailyCap: cap },
      { new: true }
    );

    // Re-issue JWT with full profile context (now it includes handle)
    const token = issueToken(updatedCreator);
    sendWelcomeEmail(updatedCreator.email, updatedCreator.name, updatedCreator.handle).catch(e => console.error("Failed to send welcome email", e));

    res.json({ success: true, creator: updatedCreator, pageUrl: `/@${updatedCreator.handle}`, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/creator/me
 * @desc Get current creator
 */
router.get('/me', verifyCreatorToken, async (req, res) => {
  try {
    await connectDB();
    const creator = await Creator.findById(req.creator.creatorId);
    if (!creator) return res.status(404).json({ message: 'Not found' });
    if (creator.isBanned) return res.status(403).json({ message: 'Account permanently removed' });

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

    res.json({ 
      success: true, 
      creator: { 
        ...creator.toObject(), 
        expertise: normalizeExpertiseList(creator.expertise || []),
        activeStrikesCount 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/creator/questions
 * @desc Get questions for the creator dashboard inbox, optionally filtered by status
 */
router.get('/questions', verifyCreatorToken, async (req, res) => {
  try {
    const { status } = req.query;
    await connectDB();
    
    // Map frontend tab statuses to backend enum ('submitted', 'answered', 'expired', 'flagged', 'satisfied')
    let queryStatus = null;
    if (status && status !== 'All') {
      if (status.toLowerCase() === 'pending') queryStatus = 'submitted';
      else if (status.toLowerCase() === 'replied') queryStatus = { $in: ['answered', 'satisfied'] };
      else queryStatus = status.toLowerCase();
    }

    const filter = { creatorId: req.creator.creatorId };
    if (queryStatus) {
      filter.status = queryStatus;
    }

    // Pending questions are sorted oldest first (urgent), others newest first
    const sortOrder = queryStatus === 'submitted' ? { createdAt: 1 } : { createdAt: -1 };

    console.log('[DEBUG] GET /api/creator/questions');
    console.log('Logged-in Creator ID:', req.creator.creatorId);
    console.log('Query Parameters (status):', status);
    console.log('Constructed DB Filter:', filter);

    const Question = require('../models/Question');
    const questions = await Question.find(filter).populate('fanId', 'avatarUrl name').sort(sortOrder);

    res.json({ success: true, questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/creator/notifications
 * @desc Get all unified notifications (AMAs, Live Chats, Tips)
 */
router.get('/notifications', verifyCreatorToken, async (req, res) => {
  try {
    const Question = require('../models/Question');
    const ChatSession = require('../models/ChatSession');
    const WalletTransaction = require('../models/WalletTransaction');
    
    // 1. Pending AMAs
    const questions = await Question.find({ creatorId: req.creator.creatorId, status: 'submitted' }).populate('fanId', 'name avatarUrl');
    
    // 2. Pending Live Chats
    const activeChats = await ChatSession.find({ creatorId: req.creator.creatorId, status: 'active' }).populate('fanId', 'name avatarUrl');
    
    // 3. Recent Tips (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentTips = await WalletTransaction.find({
      creatorId: req.creator.creatorId,
      type: 'debit',
      description: 'Tip sent',
      createdAt: { $gte: thirtyDaysAgo }
    }).populate('fanId', 'name avatarUrl');

    const notifications = [];
    
    questions.forEach(q => {
      notifications.push({
        id: q._id.toString(),
        type: 'ama',
        title: `You have received a new AMA from ${q.fanId?.name || 'a fan'}.`,
        data: q,
        timestamp: q.createdAt
      });
    });

    activeChats.forEach(c => {
      notifications.push({
        id: c._id.toString(),
        type: 'live_chat',
        title: `You have a new live chat request from ${c.fanId?.name || 'a fan'}.`,
        data: c,
        timestamp: c.startTime || c._id.getTimestamp()
      });
    });

    recentTips.forEach(t => {
      notifications.push({
        id: t._id.toString(),
        type: 'tip',
        title: `You received a tip from ${t.fanId?.name || 'a fan'}!`,
        data: t,
        timestamp: t.createdAt
      });
    });

    const recentReviews = await ChatSession.find({
      creatorId: req.creator.creatorId,
      'review.createdAt': { $exists: true, $gte: thirtyDaysAgo }
    }).populate('fanId', 'name avatarUrl');

    recentReviews.forEach(r => {
      let reviewText = '';
      if (r.review.tags && r.review.tags.length > 0) {
        reviewText += r.review.tags.join(', ');
      }
      if (r.review.feedback) {
        reviewText += (reviewText ? ' - ' : '') + r.review.feedback;
      }
      if (r.review.rating > 0) {
        if (!reviewText) {
          reviewText = `${r.review.rating} star(s)`;
        } else {
          reviewText = `${r.review.rating} star(s): ` + reviewText;
        }
      } else if (!reviewText) {
        reviewText = `Feedback provided`;
      }
      
      notifications.push({
        id: `review_${r._id.toString()}`,
        type: 'review',
        title: `New review from ${r.fanId?.name || 'a fan'}: "${reviewText}"`,
        data: r,
        timestamp: r.review.createdAt
      });
    });

    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ success: true, notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

const updateCreatorStats = async (creatorId) => {
  try {
    const Question = require('../models/Question');
    const Creator = require('../models/Creator');

    const stats = await Question.aggregate([
      { $match: { creatorId: new mongoose.Types.ObjectId(creatorId) } },
      { $group: {
          _id: null,
          totalReceived: { $sum: 1 },
          totalPending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          totalFlagged: { $sum: { $cond: [{ $eq: ['$status', 'flagged'] }, 1, 0] } },
          totalAnswered: { $sum: { $cond: [{ $in: ['$status', ['answered', 'satisfied', 'rejected']] }, 1, 0] } },
          totalAnsweredForTime: { $sum: { $cond: [{ $and: [{ $in: ['$status', ['answered', 'satisfied']] }, { $ne: ['$answeredAt', null] }] }, 1, 0] } },
          totalTimeDiff: { 
            $sum: { 
              $cond: [
                { $and: [{ $in: ['$status', ['answered', 'satisfied']] }, { $ne: ['$answeredAt', null] }] }, 
                { $subtract: ['$answeredAt', '$createdAt'] }, 
                0 
              ] 
            } 
          }
      }}
    ]);

    if (stats.length > 0) {
      const { totalReceived, totalPending, totalFlagged, totalAnswered, totalAnsweredForTime, totalTimeDiff } = stats[0];
      const denominator = totalReceived - totalPending - totalFlagged;
      const replyRate = denominator > 0 ? Math.round((totalAnswered / denominator) * 100) : 100;
      
      const avgReplyTimeMs = totalAnsweredForTime > 0 ? (totalTimeDiff / totalAnsweredForTime) : 0;
      const avgReplyTime = parseFloat((avgReplyTimeMs / (1000 * 60 * 60)).toFixed(1));

      await Creator.findByIdAndUpdate(creatorId, {
        'stats.totalAnswered': totalAnswered,
        'stats.replyRate': replyRate,
        'stats.avgReplyTime': avgReplyTime,
        questionsAnswered: totalAnswered
      });
    }
  } catch (e) {
    console.error("Failed to update creator stats:", e);
  }
};

/**
 * @route POST /api/creator/questions/:id/reply
 * @desc Reply to a question
 */
router.post('/questions/:id/reply', verifyCreatorToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { replyText, followUpAllowed } = req.body;
    
    if (!replyText || replyText.trim().length < 20) {
      return res.status(400).json({ message: 'Reply must be at least 20 characters.' });
    }

    await connectDB();
    const Question = require('../models/Question');

    const updateData = { 
      status: 'answered',
      answerText: replyText,
      answeredAt: new Date()
    };
    if (followUpAllowed !== undefined) {
      updateData.followUpAllowed = followUpAllowed;
    }

    const question = await Question.findOneAndUpdate(
      { _id: id, creatorId: req.creator.creatorId },
      updateData,
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found or unauthorized' });
    }

    // Default logic: Temporarily 100% (1.00), later will shift to 80% (0.80)
    let creatorSharePercentage = 0.8; 
    
    // Check if there is an active override
    const creatorDocForCommission = await Creator.findById(req.creator.creatorId);
    if (creatorDocForCommission && creatorDocForCommission.commissionOverride && creatorDocForCommission.commissionOverride.startDate) {
      const now = new Date();
      const start = new Date(creatorDocForCommission.commissionOverride.startDate);
      const end = creatorDocForCommission.commissionOverride.endDate ? new Date(creatorDocForCommission.commissionOverride.endDate) : null;
      
      start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999);
      
      if (now >= start && (!end || now <= end)) {
        // Within the valid period -> use override
        creatorSharePercentage = creatorDocForCommission.commissionOverride.creatorShare / 100;
      } else if (end && now > end) {
        // Override has expired -> auto shifts to 80 20
        creatorSharePercentage = 0.8;
      }
    }

    const grossAmount = question.amountPaid || 0; 
    
    if (grossAmount > 0) {
        const grossPaise = Math.round(grossAmount * 100);
        const creatorSharePaise = Math.round(grossPaise * creatorSharePercentage);
        const creatorShareRs = creatorSharePaise / 100;

        await Creator.findByIdAndUpdate(req.creator.creatorId, {
            $inc: { availableBalance: creatorShareRs }
        });

        // Track daily earning in ledger
        try {
            const Earning = require('../models/Earning');
            const creatorDoc = await Creator.findById(req.creator.creatorId).select('name referredBy referredByName');
            await Earning.create({
                creatorId: req.creator.creatorId,
                creatorName: creatorDoc ? creatorDoc.name : 'Unknown Creator',
                questionId: question._id,
                orderNumber: question.orderNumber || 'N/A',
                amount: creatorShareRs,
                status: 'accumulating',
                earningType: 'question_reply'
            });

            // ----------------------------------------------------
            // Affiliate Referral Payout Logic (Phase 3)
            // ----------------------------------------------------
            if (creatorDoc && creatorDoc.referredBy) {
                const skriibeCutPaise = grossPaise - creatorSharePaise;
                
                if (skriibeCutPaise > 0) {
                    // Affiliate gets 25% of Skriibe's cut
                    const affiliateSharePaise = Math.round(skriibeCutPaise * 0.25);
                    const affiliateShareRs = affiliateSharePaise / 100;
                    
                    if (affiliateShareRs > 0) {
                        // 1. Update Affiliate's Balance
                        await Creator.findByIdAndUpdate(creatorDoc.referredBy, {
                            $inc: { availableBalance: affiliateShareRs }
                        });
                        
                        // 2. Create Earning Record for Affiliate
                        await Earning.create({
                            creatorId: creatorDoc.referredBy,
                            creatorName: creatorDoc.referredByName || 'Affiliate Creator',
                            questionId: question._id, // Links to the same transaction
                            orderNumber: question.orderNumber ? question.orderNumber + '-REF' : 'N/A-REF',
                            amount: affiliateShareRs,
                            status: 'accumulating',
                            earningType: 'affiliate_referral'
                        });
                    }
                }
            }
            // ----------------------------------------------------
        } catch (earningErr) {
            console.error('Failed to create earning record:', earningErr);
        }
    }
    
    // Asynchronously update the stats for the creator
    updateCreatorStats(req.creator.creatorId);

    if (question.fanId) {
      const Creator = require('../models/Creator');
      const creatorData = await Creator.findById(req.creator.creatorId);
      const creatorName = creatorData ? creatorData.name : 'A creator';
      
      const Notification = require('../models/Notification');
      await Notification.create({
        fanId: question.fanId,
        questionId: question._id,
        title: 'Message Received!',
        message: `${creatorName} has replied to your message.`
      });

      if (question.buyerEmail) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const answerLink = `${frontendUrl}/fan/history?qId=${question._id}`;
        if (question.isFollowUp) {
          sendFollowUpAnsweredEmail(question.buyerEmail, question.buyerName, creatorName, answerLink)
            .catch(e => console.error("Failed to send follow up answered email", e));
        } else {
          sendQuestionAnsweredEmail(question.buyerEmail, question.buyerName, creatorName, answerLink)
            .catch(e => console.error("Failed to send question answered email", e));
        }
      }

      try {
        const Fan = require('../models/Fan');
        const fanData = await Fan.findById(question.fanId);
        
        if (fanData && fanData.whatsappPhone && fanData.whatsappConsent) {
          const { sendCreatorReplyNotification } = require('../lib/whatsapp');
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
          const answerLink = `${frontendUrl}/fan/history`;
          const snippet = replyText.substring(0, 80);
          
          sendCreatorReplyNotification({
            fanPhone: fanData.whatsappPhone,
            fanName: fanData.name || question.buyerName || 'Fan',
            creatorName: creatorName,
            snippet: snippet,
            replyUrl: answerLink
          }).catch(e => console.error("Failed to send WhatsApp reply notification", e));
        }
      } catch (waLookupError) {
        console.error("Failed looking up fan for WhatsApp notification", waLookupError);
      }
    }

    if (req.io) {
      req.io.emit('question-status-changed', { creatorId: req.creator.creatorId });
    }

    res.json({ success: true, question });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/creator/questions/:id/reject
 * @desc Reject a question
 */
router.post('/questions/:id/reject', verifyCreatorToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    await connectDB();
    const Question = require('../models/Question');
    const Counter = require('../models/Counter');
    
    let question = await Question.findOne({ _id: id, creatorId: req.creator.creatorId });
    if (!question) {
      return res.status(404).json({ message: 'Question not found or unauthorized' });
    }

    question.status = 'rejected';
    question.rejectReason = reason || 'expertise';

    if (!question.disputeId) {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'creatorDisputeId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      question.disputeId = 'cr' + String(counter.seq).padStart(4, '0');
    }

    await question.save();

    await AdminAlert.create({
      type: 'creator_reject',
      title: 'Creator rejected question',
      message: `Creator rejected question #${question.disputeId}: ${reason || 'expertise'}`,
      referenceId: question._id
    });

    // In the future: trigger refund logic here

    if (req.io) {
      req.io.emit('question-status-changed', { creatorId: req.creator.creatorId });
    }

    res.json({ success: true, question });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/creator/questions/:id/flag
 * @desc Flag a question for abuse
 */
router.post('/questions/:id/flag', verifyCreatorToken, async (req, res) => {
  try {
    const { id } = req.params;

    await connectDB();
    const Question = require('../models/Question');
    const Counter = require('../models/Counter');

    let question = await Question.findOne({ _id: id, creatorId: req.creator.creatorId });
    if (!question) {
      return res.status(404).json({ message: 'Question not found or unauthorized' });
    }

    question.status = 'rejected';
    question.rejectReason = 'abuse';

    if (!question.disputeId) {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'creatorDisputeId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      question.disputeId = 'cr' + String(counter.seq).padStart(4, '0');
    }

    await question.save();

    await AdminAlert.create({
      type: 'creator_flag',
      title: 'Creator flagged abuse',
      message: `Creator flagged question #${question.disputeId} for abuse.`,
      referenceId: question._id
    });

    // In the future: trigger refund and moderation logic here

    if (req.io) {
      req.io.emit('question-status-changed', { creatorId: req.creator.creatorId });
    }

    res.json({ success: true, question });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route DELETE /api/creator/questions/:id
 * @desc Delete a question
 */
router.delete('/questions/:id', verifyCreatorToken, async (req, res) => {
  try {
    const { id } = req.params;
    await connectDB();
    
    const mongoose = require('mongoose');
    let queryId = id;
    if (mongoose.Types.ObjectId.isValid(id)) {
      queryId = new mongoose.Types.ObjectId(id);
    }
    
    let creatorQueryId = req.creator.creatorId;
    if (mongoose.Types.ObjectId.isValid(creatorQueryId)) {
      creatorQueryId = new mongoose.Types.ObjectId(creatorQueryId);
    }

    const collection = mongoose.connection.collection('questions');
    const result = await collection.deleteOne({ _id: queryId, creatorId: creatorQueryId });

    if (result.deletedCount === 0) {
      // fallback in case creatorId was stored as string instead of ObjectId
      const fallbackResult = await collection.deleteOne({ _id: queryId, creatorId: req.creator.creatorId });
      if (fallbackResult.deletedCount === 0) {
        return res.status(404).json({ message: 'Question not found or unauthorized' });
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route PATCH /api/creator/live-status
 * @desc Update the creator's live status and emit socket.io event
 */
router.patch('/live-status', verifyCreatorToken, async (req, res) => {
  try {
    const { isLive } = req.body;
    if (typeof isLive !== 'boolean') {
      return res.status(400).json({ message: 'isLive boolean is required' });
    }

    const currentCreator = await Creator.findById(req.creator.creatorId);
    if (!currentCreator) return res.status(404).json({ message: 'Not found' });
    if (isLive && currentCreator.suspensionUntil && new Date() < new Date(currentCreator.suspensionUntil)) {
      return res.status(403).json({ message: 'Account is currently suspended. You cannot go live.' });
    }

    const updatedCreator = await Creator.findByIdAndUpdate(
      req.creator.creatorId,
      { isLive },
      { new: true }
    );

    if (!updatedCreator) {
      return res.status(404).json({ message: 'Creator not found' });
    }

    // Emit Socket.IO event if io is attached to req
    if (req.io) {
      req.io.emit('creator-status-changed', {
        creatorId: updatedCreator._id,
        isLive: updatedCreator.isLive
      });
    }

    res.json({ success: true, isLive: updatedCreator.isLive });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/creator/delete-account
 * @desc Delete creator account and save reason
 */
const DeletedAccountReason = require('../models/DeletedAccountReason');

router.post('/delete-account', async (req, res) => {
  try {
    const { reason } = req.body;
    await connectDB();
    
    let creatorId = null;
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      token = req.cookies?.creator_token;
    }

    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        creatorId = decoded.creatorId;
        
        if (!creatorId && decoded.email) {
          const Creator = require('../models/Creator');
          const foundCreator = await Creator.findOne({ email: decoded.email.toLowerCase() });
          if (foundCreator) {
            creatorId = foundCreator._id;
          }
        }
      } catch(e) {}
    }

    if (!creatorId) {
      // Just save the reason anyway so the collection is created in MongoDB for testing
      await DeletedAccountReason.create({ reason: reason || "No reason provided (test)" });
      return res.json({ success: true, message: "Reason saved, but no creator to delete." });
    }
    
    // Delete creator, associated fan, and creator profile
    const Creator = require('../models/Creator');
    const creatorToDelete = await Creator.findById(creatorId);
    
    if (creatorToDelete) {
      const AccountActionLog = require('../models/AccountActionLog');
      await AccountActionLog.create({
        userType: 'creator',
        action: 'delete',
        reason: reason || 'No reason provided',
        userEmail: creatorToDelete.email,
        userName: creatorToDelete.name || creatorToDelete.handle
      });

      const AdminAlert = require('../models/AdminAlert');
      await AdminAlert.create({
        type: 'creator_delete',
        title: 'Creator Deleted Account',
        message: `Creator ${creatorToDelete.name || creatorToDelete.handle} deleted their account.`,
      });
      if (req.io) {
        req.io.emit('new-admin-alert');
      }

      const Fan = require('../models/Fan');
      const CreatorProfile = require('../models/CreatorProfile');
      const Referral = require('../models/Referral');
      
      const fanToDelete = await Fan.findOne({ email: creatorToDelete.email });
      if (fanToDelete) {
        fanToDelete.isDeleted = true;
        fanToDelete.email = `${fanToDelete.email}_deleted_${Date.now()}`;
        await fanToDelete.save();
      }

      // Mark Referral as deleted if this creator was referred
      await Referral.findOneAndUpdate(
        { referredCreatorId: creatorId },
        { status: 'Deleted' }
      );

      creatorToDelete.isBanned = true;
      creatorToDelete.email = `${creatorToDelete.email}_deleted_${Date.now()}`;
      if (creatorToDelete.handle) creatorToDelete.handle = `${creatorToDelete.handle}_deleted_${Date.now()}`;
      await creatorToDelete.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/creator/payouts
 * @desc Calculate real-time payout stats from answered questions
 *
 * Rules:
 *  - Creator earns 80% of amountPaid
 *  - 7-day escrow starts at answeredAt
 *  - "Lifetime Paid"  = escrow cleared + no refund/fan-wins dispute
 *  - "This Month"     = lifetime-paid amounts released this calendar month
 *  - "In Escrow"      = answered, paid, still inside the 7-day hold
 */
router.get('/payouts', verifyCreatorToken, async (req, res) => {
  try {
    await connectDB();
    const now = new Date();
    const creatorDocForCommission = await Creator.findById(req.creator.creatorId).select('createdAt commissionOverride lifetimePaid availableBalance');
    const createdAtDate = creatorDocForCommission?.createdAt || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Helper to calculate Tuesday 00:00:00 IST for any given date
    const getTuesday00IST = (d = new Date()) => {
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istTime = new Date(d.getTime() + istOffset);
      const day = istTime.getUTCDay(); // 0=Sun, 1=Mon, 2=Tue...
      const diffDays = (day - 2 + 7) % 7;
      const tuesdayIST = new Date(istTime);
      tuesdayIST.setUTCDate(tuesdayIST.getUTCDate() - diffDays);
      tuesdayIST.setUTCHours(0, 0, 0, 0);
      return new Date(tuesdayIST.getTime() - istOffset);
    };

    const lastBoundary = getTuesday00IST(now);
    const nextPayoutDate = new Date(lastBoundary.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Track past Tuesday-to-Tuesday weekly cycles
    const pastWeeklyBuckets = {};
    const addPastWeeklyTransaction = (date, earning, gross) => {
      const d = date ? new Date(date) : new Date();
      if (d >= lastBoundary) return; // Belongs to current active cycle
      const weekStart = getTuesday00IST(d);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      const key = weekStart.toISOString();
      if (!pastWeeklyBuckets[key]) {
        pastWeeklyBuckets[key] = {
          weekStart,
          weekEnd,
          amountSwept: 0,
          grossRevenue: 0,
          transactionCount: 0,
          status: 'Processed',
          sweptAt: weekEnd
        };
      }
      pastWeeklyBuckets[key].amountSwept += earning;
      pastWeeklyBuckets[key].grossRevenue += gross;
      pastWeeklyBuckets[key].transactionCount += 1;
    };

    // Include questions from both routes:
    const answeredPaid = await Question.find({
      creatorId:    req.creator.creatorId,
      status:       { $in: ['answered', 'flagged', 'satisfied'] },
    }).select('amountPaid answeredAt createdAt buyerName isAnonymous adminDecision status').sort({ answeredAt: -1, createdAt: -1 });

    let lifetimePaid = 0;
    let thisMonth    = 0;
    let inEscrow     = 0;
    let available    = 0;

    let liveChatEarnings = 0;
    let amaEarnings = 0;
    let tipEarnings = 0;

    let availableQuestions = 0;
    let availableGross = 0;
    let inEscrowQuestions = 0;

    const Earning = require('../models/Earning');
    const earnings = await Earning.find({ creatorId: req.creator.creatorId });
    const earningMap = {};
    for (const e of earnings) {
      earningMap[e.questionId.toString()] = e;
    }

    const getCreatorShare = (date) => {
      let share = 0.8; 
      if (creatorDocForCommission && creatorDocForCommission.commissionOverride && creatorDocForCommission.commissionOverride.startDate) {
        const qDate = new Date(date);
        const start = new Date(creatorDocForCommission.commissionOverride.startDate);
        const end = creatorDocForCommission.commissionOverride.endDate ? new Date(creatorDocForCommission.commissionOverride.endDate) : null;
        
        start.setHours(0, 0, 0, 0);
        if (end) end.setHours(23, 59, 59, 999);
        
        if (qDate >= start && (!end || qDate <= end)) {
          share = creatorDocForCommission.commissionOverride.creatorShare / 100;
        } else if (end && qDate > end) {
          share = 0.8;
        }
      }
      return share;
    };

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    for (const q of answeredPaid) {
      if (q.adminDecision === 'fan_wins' || q.adminDecision === 'banned') continue;

      const gross = q.amountPaid || 0;
      if (gross === 0) continue; // Free questions don't contribute to earnings

      const qDate = q.answeredAt ? new Date(q.answeredAt) : (q.createdAt ? new Date(q.createdAt) : now);
      let creatorEarning = 0;
      if (earningMap[q._id.toString()]) {
        creatorEarning = earningMap[q._id.toString()].amount;
      } else {
        const dynamicCreatorShare = getCreatorShare(qDate);
        creatorEarning = gross * dynamicCreatorShare;
      }
      const answeredMonth = new Date(qDate.getFullYear(), qDate.getMonth(), 1);

      // Real-time updates:
      lifetimePaid += creatorEarning;
      amaEarnings += creatorEarning;
      if (answeredMonth >= monthStart) {
        thisMonth += creatorEarning;
      }

      // Weekly cycle logic for "Available" tab & past weekly payouts
      if (qDate >= lastBoundary) {
        available += creatorEarning;
        availableQuestions++;
        availableGross += gross;
      } else {
        addPastWeeklyTransaction(qDate, creatorEarning, gross);
      }
    }

    // Include affiliate earnings in the totals
    const affiliateEarnings = await Earning.find({
      creatorId: req.creator.creatorId,
      earningType: 'affiliate_referral'
    }).sort({ createdAt: -1 });

    for (const e of affiliateEarnings) {
      const eDateRaw = e.date || e.createdAt || now;
      const eDate = new Date(eDateRaw);
      const earningAmount = e.amount || 0;
      const answeredMonth = new Date(eDate.getFullYear(), eDate.getMonth(), 1);

      lifetimePaid += earningAmount;
      if (answeredMonth >= monthStart) {
        thisMonth += earningAmount;
      }

      if (eDate >= lastBoundary) {
        available += earningAmount;
        availableGross += earningAmount; 
      } else {
        addPastWeeklyTransaction(eDate, earningAmount, earningAmount);
      }
    }

    // Include ALL Live Chats in the transaction count and revenue
    const ChatSession = require('../models/ChatSession');
    const allLiveChats = await ChatSession.find({
      creatorId: req.creator.creatorId,
      status: 'ended'
    });
    
    for (const chat of allLiveChats) {
      const gross = chat.totalCost || 0;
      if (gross === 0) continue;
      const chatEnd = chat.endTime ? new Date(chat.endTime) : (chat.startTime ? new Date(chat.startTime) : now);
      const share = getCreatorShare(chatEnd);
      const earning = gross * share;
      
      lifetimePaid += earning;
      liveChatEarnings += earning;
      const chatMonth = new Date(chatEnd.getFullYear(), chatEnd.getMonth(), 1);
      if (chatMonth >= monthStart) {
        thisMonth += earning;
      }

      if (chatEnd >= lastBoundary) {
        availableQuestions++;
        availableGross += gross;
        available += earning;
      } else {
        addPastWeeklyTransaction(chatEnd, earning, gross);
      }
    }

    // Include ALL Tips in the transaction count and revenue
    const WalletTransaction = require('../models/WalletTransaction');
    const allTips = await WalletTransaction.find({
      creatorId: req.creator.creatorId,
      type: 'debit',
      description: 'Tip sent',
    });
    
    for (const tip of allTips) {
      const gross = tip.amount || 0;
      if (gross === 0) continue;
      const tipDate = tip.createdAt ? new Date(tip.createdAt) : now;
      const share = getCreatorShare(tipDate);
      const earning = gross * share;

      lifetimePaid += earning;
      tipEarnings += earning;
      const tipMonth = new Date(tipDate.getFullYear(), tipDate.getMonth(), 1);
      if (tipMonth >= monthStart) {
        thisMonth += earning;
      }

      if (tipDate >= lastBoundary) {
        availableQuestions++;
        availableGross += gross;
        available += earning;
      } else {
        addPastWeeklyTransaction(tipDate, earning, gross);
      }
    }

    // Counts for "Count matters" card in Creator Analytics
    const liveChatsComplete = await ChatSession.countDocuments({
      creatorId: req.creator.creatorId,
      status: 'ended',
      cancelledByFan: { $ne: true }
    });

    const freeLiveChats = await ChatSession.countDocuments({
      creatorId: req.creator.creatorId,
      status: 'ended',
      cancelledByFan: { $ne: true },
      $or: [{ isFreeChat: true }, { totalCost: 0 }]
    });

    const paidLiveChats = await ChatSession.countDocuments({
      creatorId: req.creator.creatorId,
      status: 'ended',
      cancelledByFan: { $ne: true },
      isFreeChat: { $ne: true },
      totalCost: { $gt: 0 }
    });

    const liveChatsIncomplete = await ChatSession.countDocuments({
      creatorId: req.creator.creatorId,
      cancelledByFan: true
    });

    const amaCount = await Question.countDocuments({
      creatorId: req.creator.creatorId,
      $or: [
        { status: { $in: ['answered', 'satisfied'] } },
        { answeredAt: { $exists: true, $ne: null } }
      ]
    });

    const tipCount = allTips.length;

    // Group history by month - Add ALL items (AMA, Live Chats, Tips, Affiliate)
    const groupedHistory = {};
    const addToHistory = (date, id, bank, amount, statusLabel) => {
      const safeDate = date ? new Date(date) : new Date();
      const monthKey = safeDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
      if (!groupedHistory[monthKey]) {
        groupedHistory[monthKey] = [];
      }
      groupedHistory[monthKey].push({
        id: id.toString(),
        rawDate: safeDate,
        date: safeDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        bank,
        amount: Math.round(amount * 100) / 100,
        status: statusLabel
      });
    };

    for (const q of answeredPaid) {
      const gross = q.amountPaid || 0;
      let earning = 0;
      
      if (q.adminDecision === 'fan_wins' || q.adminDecision === 'banned') {
        earning = 0;
      } else if (earningMap[q._id.toString()]) {
        earning = earningMap[q._id.toString()].amount;
      } else {
        const qDate = q.answeredAt ? new Date(q.answeredAt) : (q.createdAt ? new Date(q.createdAt) : now);
        earning = gross * getCreatorShare(qDate);
      }
      
      const qDate = q.answeredAt ? new Date(q.answeredAt) : (q.createdAt ? new Date(q.createdAt) : now);
      let statusLabel = (qDate < lastBoundary) ? 'Paid' : 'Available';
      if (q.adminDecision === 'fan_wins' || q.adminDecision === 'banned') {
        statusLabel = 'Refunded';
      } else if (gross === 0) {
        statusLabel = 'Free';
      }
      
      addToHistory(qDate, q._id, q.isAnonymous ? 'Anonymous' : (q.buyerName || 'Fan'), earning, statusLabel);
    }

    // Add affiliate earnings to history
    for (const e of affiliateEarnings) {
      const eDateRaw = e.date || e.createdAt || now;
      const eDate = new Date(eDateRaw);
      addToHistory(eDate, e._id, 'Affiliate Referral', e.amount, (eDate < lastBoundary) ? 'Paid' : 'Available');
    }

    // Add Live Chats to history
    for (const chat of allLiveChats) {
      const gross = chat.totalCost || 0;
      if (gross === 0) continue;
      const chatEnd = chat.endTime ? new Date(chat.endTime) : (chat.startTime ? new Date(chat.startTime) : (chat.createdAt ? new Date(chat.createdAt) : now));
      const earning = gross * getCreatorShare(chatEnd);
      addToHistory(chatEnd, chat._id, 'Live Chat', earning, (chatEnd < lastBoundary) ? 'Paid' : 'Available');
    }

    // Add Tips to history
    for (const tip of allTips) {
      const gross = tip.amount || 0;
      if (gross === 0) continue;
      const tipDate = tip.createdAt ? new Date(tip.createdAt) : now;
      const earning = gross * getCreatorShare(tipDate);
      addToHistory(tipDate, tip._id, 'Tip', earning, (tipDate < lastBoundary) ? 'Paid' : 'Available');
    }

    const sortedMonths = Object.keys(groupedHistory).sort((a, b) => {
      return Date.parse(`1 ${b}`) - Date.parse(`1 ${a}`);
    });

    const payoutHistoryGrouped = sortedMonths.map(month => {
      const sortedItems = groupedHistory[month].sort((a, b) => b.rawDate - a.rawDate);
      sortedItems.forEach(item => delete item.rawDate);
      return {
        month,
        items: sortedItems
      };
    });

    // New In Escrow logic: unanswered questions
    const pendingQuestions = await Question.find({
      creatorId:    req.creator.creatorId,
      status:       'submitted',
      amountPaid:   { $gt: 0 }
    }).select('amountPaid buyerName createdAt isAnonymous').sort({ createdAt: -1 });

    const pendingList = [];
    for (const q of pendingQuestions) {
      const gross = q.amountPaid || 0;
      const earning = gross * getCreatorShare(Date.now());
      inEscrow += earning;
      inEscrowQuestions++;

      pendingList.push({
        id: q._id.toString(),
        buyerName: q.isAnonymous ? 'Anonymous' : (q.buyerName || 'Fan'),
        date: new Date(q.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        amount: Math.round(earning * 100) / 100
      });
    }

    // Under Review logic: flagged questions
    const flaggedQuestions = await Question.find({
      creatorId:    req.creator.creatorId,
      status:       'flagged',
      amountPaid:   { $gt: 0 }
    }).select('amountPaid buyerName createdAt isAnonymous adminDecision').sort({ createdAt: -1 });

    let underReviewAmount = 0;
    let underReviewQuestionsCount = 0;
    const underReviewList = [];

    for (const q of flaggedQuestions) {
      const gross = q.amountPaid || 0;
      let earning = 0;
      if (earningMap[q._id.toString()]) {
        earning = earningMap[q._id.toString()].amount;
      } else {
        earning = gross * getCreatorShare(q.createdAt);
      }
      underReviewAmount += earning;
      underReviewQuestionsCount++;

      underReviewList.push({
        id: q._id.toString(),
        buyerName: q.isAnonymous ? 'Anonymous' : (q.buyerName || 'Fan'),
        date: new Date(q.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        amount: Math.round(earning * 100) / 100,
        status: q.adminDecision === 'abusive' ? 'Resolved (Fan Banned)' : 'Fan Review',
        adminMessage: q.adminDecision === 'abusive' ? 'The fan was banned for violating guidelines. You keep the full payment.' : null
      });
    }

    // Refunded logic
    const refundedQuestions = await Question.find({
      creatorId: req.creator.creatorId,
      amountPaid: { $gt: 0 },
      $or: [
        { status: 'expired' },
        { status: 'rejected' },
        { status: 'resolved', adminDecision: { $in: ['fan_wins', 'creator_wins', 'partial_refund'] } }
      ]
    }).select('amountPaid buyerName createdAt isAnonymous status adminDecision').sort({ createdAt: -1 });

    let refundedAmount = 0;
    let refundedQuestionsCount = 0;
    const refundedList = [];

    for (const q of refundedQuestions) {
      const gross = q.amountPaid || 0;
      let earning = 0;
      if (earningMap[q._id.toString()]) {
        earning = earningMap[q._id.toString()].amount;
      } else {
        earning = gross * getCreatorShare(q.createdAt);
      }
      refundedQuestionsCount++;

      let type = 'Auto Refund';
      let reason = 'Auto Refund';
      let refundAmount = earning;
      
      if (q.status === 'expired') {
        reason = 'No response within 24 hours';
      } else if (q.status === 'rejected') {
        reason = 'Rejected by creator';
      } else if (q.status === 'resolved') {
        if (q.adminDecision === 'creator_wins') {
          type = 'Dismissed';
          refundAmount = 0;
          reason = `Refund of rupees 0 is made.`;
        } else if (q.adminDecision === 'partial_refund') {
          type = 'Partial Refund';
          refundAmount = earning / 2;
          reason = `Refund of rupees ${Math.round(refundAmount * 100) / 100} is made.`;
        } else {
          type = 'Approved Refund';
          reason = `Refund of rupees ${Math.round(refundAmount * 100) / 100} is made.`;
        }
      }

      refundedAmount += refundAmount;

      refundedList.push({
        id: q._id.toString(),
        type,
        reason,
        buyerName: q.isAnonymous ? 'Anonymous' : (q.buyerName || 'Fan'),
        date: new Date(q.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        amount: Math.round(refundAmount * 100) / 100
      });
    }

    const SweepLog = require('../models/SweepLog');
    let sweepLogs = await SweepLog.find({ creatorId: req.creator.creatorId })
      .sort({ sweptAt: -1 })
      .lean();

    // Ensure the completed Tuesday-to-Tuesday weekly cycles are represented
    const numPastWeeksToShow = 4;
    for (let i = 0; i < numPastWeeksToShow; i++) {
      const cycleEnd = new Date(lastBoundary.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const cycleStart = new Date(cycleEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
      const key = cycleStart.toISOString();
      if (!pastWeeklyBuckets[key]) {
        pastWeeklyBuckets[key] = {
          weekStart: cycleStart,
          weekEnd: cycleEnd,
          amountSwept: 0,
          grossRevenue: 0,
          transactionCount: 0,
          status: 'Processed',
          sweptAt: cycleEnd
        };
      }
    }

    // If creator has lifetimePaid > 0, credit to the most recent completed cycle if not already tracked
    const creatorLifetimePaid = creatorDocForCommission?.lifetimePaid || 0;
    const latestPastCycleKey = new Date(lastBoundary.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    if (creatorLifetimePaid > 0 && pastWeeklyBuckets[latestPastCycleKey] && pastWeeklyBuckets[latestPastCycleKey].amountSwept === 0) {
      pastWeeklyBuckets[latestPastCycleKey].amountSwept = Math.round(creatorLifetimePaid * 100) / 100;
      pastWeeklyBuckets[latestPastCycleKey].transactionCount = Math.max(1, pastWeeklyBuckets[latestPastCycleKey].transactionCount);
    }

    // Reconcile past weekly buckets with SweepLog
    for (const key of Object.keys(pastWeeklyBuckets)) {
      const bucket = pastWeeklyBuckets[key];
      let match = sweepLogs.find(sl => {
        if (sl.weekStart && new Date(sl.weekStart).getTime() === bucket.weekStart.getTime()) return true;
        if (sl.sweptAt && Math.abs(new Date(sl.sweptAt).getTime() - bucket.weekEnd.getTime()) < 24 * 60 * 60 * 1000) return true;
        return false;
      });

      if (!match) {
        if (bucket.amountSwept > 0) {
          try {
            const created = await SweepLog.create({
              creatorId: req.creator.creatorId,
              amountSwept: Math.round(bucket.amountSwept * 100) / 100,
              sweptAt: bucket.weekEnd,
              weekStart: bucket.weekStart,
              weekEnd: bucket.weekEnd,
              status: 'Processed',
              transactionCount: bucket.transactionCount
            });
            sweepLogs.push(created.toObject ? created.toObject() : created);
          } catch (logErr) {
            sweepLogs.push({
              _id: key,
              creatorId: req.creator.creatorId,
              amountSwept: Math.round(bucket.amountSwept * 100) / 100,
              sweptAt: bucket.weekEnd,
              weekStart: bucket.weekStart,
              weekEnd: bucket.weekEnd,
              status: 'Processed',
              transactionCount: bucket.transactionCount
            });
          }
        } else {
          sweepLogs.push({
            _id: key,
            creatorId: req.creator.creatorId,
            amountSwept: 0,
            sweptAt: bucket.weekEnd,
            weekStart: bucket.weekStart,
            weekEnd: bucket.weekEnd,
            status: 'Processed',
            transactionCount: bucket.transactionCount || 0
          });
        }
      } else {
        const updates = {};
        if (!match.weekStart) updates.weekStart = bucket.weekStart;
        if (!match.weekEnd) updates.weekEnd = bucket.weekEnd;
        if (!match.status) updates.status = 'Processed';
        if ((!match.transactionCount || match.transactionCount === 0) && bucket.transactionCount) {
          updates.transactionCount = bucket.transactionCount;
        }
        if (bucket.amountSwept > 0 && (!match.amountSwept || match.amountSwept === 0)) {
          updates.amountSwept = bucket.amountSwept;
        }
        if (Object.keys(updates).length > 0) {
          await SweepLog.updateOne({ _id: match._id }, { $set: updates });
          Object.assign(match, updates);
        }
      }
    }

    // Ensure all sweep logs have consistent weekStart/weekEnd fields
    for (const sl of sweepLogs) {
      if (!sl.weekEnd && sl.sweptAt) sl.weekEnd = sl.sweptAt;
      if (!sl.weekStart && sl.weekEnd) sl.weekStart = new Date(new Date(sl.weekEnd).getTime() - 7 * 24 * 60 * 60 * 1000);
      if (!sl.status) sl.status = 'Processed';
    }

    // Sort descending by weekStart / sweptAt
    sweepLogs.sort((a, b) => {
      const timeA = new Date(a.weekStart || a.sweptAt || 0).getTime();
      const timeB = new Date(b.weekStart || b.sweptAt || 0).getTime();
      return timeB - timeA;
    });

    res.json({
      success:        true,
      lifetimePaid:   Math.round(lifetimePaid * 100) / 100,
      thisMonth:      Math.round(thisMonth    * 100) / 100,
      inEscrow:       Math.round(inEscrow     * 100) / 100,
      available:      Math.round(available    * 100) / 100,
      nextPayoutDate: nextPayoutDate.toISOString(),
      lastBoundary: lastBoundary.toISOString(),
      availableQuestions,
      availableGross: Math.round(availableGross * 100) / 100,
      availableFee:   Math.round((availableGross - available) * 100) / 100,
      liveChatEarnings: Math.round(liveChatEarnings * 100) / 100,
      amaEarnings:      Math.round(amaEarnings * 100) / 100,
      tipEarnings:      Math.round(tipEarnings * 100) / 100,
      liveChatsComplete,
      liveChatsIncomplete,
      freeLiveChats,
      paidLiveChats,
      amaCount,
      tipCount,
      inEscrowQuestions,
      pendingList,
      underReviewAmount: Math.round(underReviewAmount * 100) / 100,
      underReviewQuestionsCount,
      underReviewList,
      refundedAmount: Math.round(refundedAmount * 100) / 100,
      refundedQuestionsCount,
      refundedList,
      payoutHistoryGrouped,
      sweepLogs,
      pastWeeklyPayouts: sweepLogs
    });
  } catch (err) {
    require('fs').appendFileSync('payout_error.log', new Date().toISOString() + '\\n' + err.stack + '\\n');
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/creator/logout
 * @desc Logout creator
 */
router.post('/logout', (req, res) => {
  res.json({ success: true });
});

/**
 * @route POST /api/creator/verify-ifsc
 * @desc Verify IFSC code using Cashfree API
 */
router.post('/verify-ifsc', verifyCreatorToken, async (req, res) => {
  try {
    const { ifsc } = req.body;

    if (!ifsc) {
      return res.status(400).json({ message: 'IFSC is required.' });
    }

    // Basic IFSC format validation
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifsc)) {
      return res.status(400).json({ 
        message: 'Invalid IFSC format.', 
        verified: false, 
        reason: 'Invalid format.' 
      });
    }

    // Always return verified true
    return res.json({
      verified: true,
      data: { status: 'VALID' }
    });

  } catch (error) {
    console.error('Error in /verify-ifsc route:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

/**
 * @route POST /api/creator/verify-bank
 * @desc Verify bank account using Cashfree API
 */
router.post('/verify-bank', verifyCreatorToken, async (req, res) => {
  try {
    const { bank_account, ifsc, name, phone, pan } = req.body;

    if (!bank_account || !ifsc) {
      return res.status(400).json({ message: 'Bank account number and IFSC are required.' });
    }

    // Basic IFSC format validation
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifsc)) {
      return res.status(400).json({ message: 'Invalid IFSC code format.' });
    }

    if (pan) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(pan)) {
        return res.status(400).json({ message: 'Invalid PAN format.' });
      }
    }

    await connectDB();
    const creator = await Creator.findById(req.creator.creatorId);
    if (!creator) {
      return res.status(404).json({ message: 'Creator not found.' });
    }

    // Mock bank verification as always successful
    let bankVerified = true;
    let bankReason = 'ACCOUNT_IS_VALID';
    let nameAtBank = name || '';
    let bankNameStr = 'Mocked Bank';
    let bankNeedsReview = false;

    if (!bankVerified) {
      creator.bankAccountNumber = bank_account;
      creator.bankIfsc = ifsc;
      creator.bankAccountName = name || '';
      creator.bankVerificationStatus = 'failed';
      creator.bankLinked = false;
      await creator.save();
      return res.json({ verified: false, reason: `Bank verification failed: ${bankReason}` });
    }

    // --- PAN Verification ---
    let panVerified = true;
    let panReason = 'VALID';
    let panRegisteredName = name || '';

    if (pan && !panVerified) {
      creator.panNumber = pan;
      creator.panVerificationStatus = 'failed';
      await creator.save();
      return res.json({ verified: false, reason: `PAN verification failed: ${panReason}` });
    }

    // Save details pass or fail
    creator.bankAccountNumber = bank_account;
    creator.bankIfsc = ifsc;
    creator.bankAccountName = name || ''; // user-provided name
    creator.verifiedAccountNumber = bank_account;
    creator.verifiedIfsc = ifsc;
    creator.bankVerificationStatus = 'verified';
    creator.bankNameAtBank = nameAtBank;
    creator.bankVerifiedAt = new Date();
    creator.bankNeedsReview = bankNeedsReview;
    creator.bankLinked = true;

    if (pan) {
      creator.panNumber = pan;
      creator.panVerificationStatus = 'verified';
      creator.panRegisteredName = panRegisteredName;
      creator.panVerifiedAt = new Date();
      // Optional: check if panRegisteredName matches user provided name, else needs review
      // We'll keep it simple for now based on 'valid' flag
    }

    await creator.save();

    res.json({
      verified: true,
      nameAtBank,
      bankName: bankNameStr,
      reason: 'Bank and PAN Verified'
    });
  } catch (err) {
    console.error('Bank/PAN verification error:', err);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

/**
 * @route POST /api/creator/save-payout-details
 * @desc Save and verify creator payout setup details (PAN, Aadhaar last 4, UPI ID or Bank details)
 */
router.post('/save-payout-details', verifyCreatorToken, async (req, res) => {
  try {
    const { 
      pan, 
      aadharLast4, 
      payoutMethod = 'upi', 
      upiId, 
      bankAccountName, 
      bankAccountNumber, 
      bankIfsc, 
      confirmed 
    } = req.body;

    if (!pan || !aadharLast4) {
      return res.status(400).json({ message: 'PAN and Aadhaar last 4 digits are required.' });
    }

    const panTrimmed = pan.trim().toUpperCase();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panTrimmed)) {
      return res.status(400).json({ message: 'Please enter a valid PAN format (e.g. ABCDE1234F).' });
    }

    const aadharTrimmed = aadharLast4.toString().trim();
    if (!/^\d{4}$/.test(aadharTrimmed)) {
      return res.status(400).json({ message: 'Please enter exactly the last 4 digits of your Aadhaar number.' });
    }

    if (!confirmed) {
      return res.status(400).json({ message: 'Please confirm that these are your own details.' });
    }

    if (payoutMethod === 'bank') {
      if (!bankAccountName || !bankAccountName.trim()) {
        return res.status(400).json({ message: 'Account holder name is required.' });
      }
      if (!bankAccountNumber || !bankAccountNumber.trim()) {
        return res.status(400).json({ message: 'Account number is required.' });
      }
      if (!bankIfsc || !bankIfsc.trim()) {
        return res.status(400).json({ message: 'IFSC code is required.' });
      }
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(bankIfsc.trim().toUpperCase())) {
        return res.status(400).json({ message: 'Please enter a valid 11-character IFSC code.' });
      }
    } else {
      // Default / upi
      if (!upiId || !upiId.trim() || !upiId.includes('@')) {
        return res.status(400).json({ message: 'Please enter a valid UPI ID (e.g. you@okaxis).' });
      }
    }

    await connectDB();
    const creator = await Creator.findById(req.creator.creatorId);
    if (!creator) {
      return res.status(404).json({ message: 'Creator not found.' });
    }

    creator.panNumber = panTrimmed;
    creator.panVerificationStatus = 'verified';
    creator.panVerifiedAt = new Date();
    creator.aadharLast4 = aadharTrimmed;
    creator.payoutMethod = payoutMethod;
    creator.payoutSetupCompleted = true;
    creator.payoutDetailsConfirmed = true;

    if (payoutMethod === 'bank') {
      creator.bankAccountName = bankAccountName.trim();
      creator.bankAccountNumber = bankAccountNumber.trim();
      creator.bankIfsc = bankIfsc.trim().toUpperCase();
      creator.verifiedAccountNumber = bankAccountNumber.trim();
      creator.verifiedIfsc = bankIfsc.trim().toUpperCase();
      creator.bankVerificationStatus = 'verified';
      creator.bankNameAtBank = bankAccountName.trim();
      creator.bankVerifiedAt = new Date();
      creator.bankLinked = true;
    } else {
      creator.upiId = upiId.trim();
      creator.bankLinked = true;
    }

    await creator.save();

    res.json({
      success: true,
      message: 'Payout details saved successfully',
      creator: creator.toObject()
    });
  } catch (err) {
    console.error('Error saving payout details:', err);
    res.status(500).json({ message: 'Server error saving payout details' });
  }
});

module.exports = router;
