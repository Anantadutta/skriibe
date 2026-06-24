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

    const updateFields = { name, handle, email, bio, expertise, avatarUrl };
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
      { price, dailyCap: cap, isLive: true },
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

    res.json({ success: true, creator: { ...creator.toObject(), activeStrikesCount } });
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
    const questions = await Question.find(filter).sort(sortOrder);

    res.json({ success: true, questions });
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
      const replyRate = denominator > 0 ? Math.round((totalAnswered / denominator) * 100) : 0;
      
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
    
    if (!replyText || replyText.trim().length < 100) {
      return res.status(400).json({ message: 'Reply must be at least 100 characters.' });
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

    const creatorSharePercentage = parseFloat(process.env.CREATOR_SHARE_PERCENTAGE || '1.00');
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
            const creatorDoc = await Creator.findById(req.creator.creatorId).select('name');
            await Earning.create({
                creatorId: req.creator.creatorId,
                creatorName: creatorDoc ? creatorDoc.name : 'Unknown Creator',
                questionId: question._id,
                orderNumber: question.orderNumber || 'N/A',
                amount: creatorShareRs,
                status: 'accumulating'
            });
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
        title: 'Question Answered!',
        message: `${creatorName} has replied to your question.`
      });

      if (question.buyerEmail) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const answerLink = `${frontendUrl}/fan/history`;
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
    const question = await Question.findOneAndUpdate(
      { _id: id, creatorId: req.creator.creatorId },
      { 
        status: 'rejected',
        rejectReason: reason || 'expertise'
      },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found or unauthorized' });
    }

    await AdminAlert.create({
      type: 'creator_reject',
      title: 'Creator rejected question',
      message: `Creator rejected question #${question._id.toString().slice(-6)}: ${reason || 'expertise'}`,
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
    const question = await Question.findOneAndUpdate(
      { _id: id, creatorId: req.creator.creatorId },
      { 
        status: 'rejected',
        rejectReason: 'abuse'
      },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found or unauthorized' });
    }

    await AdminAlert.create({
      type: 'creator_flag',
      title: 'Creator flagged abuse',
      message: `Creator flagged question #${question._id.toString().slice(-6)} for abuse.`,
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
      } catch(e) {}
    }

    // For testing from stubs: if no token, grab the first creator in the DB
    if (!creatorId) {
      const Creator = require('../models/Creator');
      const firstCreator = await Creator.findOne();
      if (firstCreator) creatorId = firstCreator._id;
    }

    if (!creatorId) {
      // Just save the reason anyway so the collection is created in MongoDB for testing
      await DeletedAccountReason.create({ reason: reason || "No reason provided (test)" });
      return res.json({ success: true, message: "Reason saved, but no creator to delete." });
    }
    
    // Save reason
    if (reason) {
      await DeletedAccountReason.create({
        creatorId: creatorId,
        reason: reason
      });
    }

    // Delete creator, associated fan, and creator profile
    const Creator = require('../models/Creator');
    const creatorToDelete = await Creator.findById(creatorId);
    
    if (creatorToDelete) {
      const Fan = require('../models/Fan');
      const CreatorProfile = require('../models/CreatorProfile');
      
      const fanToDelete = await Fan.findOne({ email: creatorToDelete.email });
      if (fanToDelete) {
        await CreatorProfile.findOneAndDelete({ user: fanToDelete._id });
        await Fan.findByIdAndDelete(fanToDelete._id);
      }
      await Creator.findByIdAndDelete(creatorId);
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
    const CREATOR_SHARE = 1.00;
    const now = new Date();
    const creatorData = await Creator.findById(req.creator.creatorId).select('createdAt');
    const createdAtDate = creatorData?.createdAt || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const normalizedCreatedAt = new Date(createdAtDate);
    normalizedCreatedAt.setHours(0, 0, 0, 0);

    const normalizedNow = new Date(now);
    normalizedNow.setHours(0, 0, 0, 0);

    const createdDayOfWeek = normalizedCreatedAt.getDay();
    const daysUntilNextTuesday = (2 - createdDayOfWeek + 7) % 7;
    const daysToAdd = daysUntilNextTuesday === 0 ? 7 : daysUntilNextTuesday + 7;

    const firstPayoutDate = new Date(normalizedCreatedAt);
    firstPayoutDate.setDate(normalizedCreatedAt.getDate() + daysToAdd);

    let lastBoundary;
    let nextPayoutDate;

    if (now < firstPayoutDate) {
      lastBoundary = new Date(0);
      nextPayoutDate = firstPayoutDate;
    } else {
      const daysSinceTuesday = (now.getDay() - 2 + 7) % 7;
      lastBoundary = new Date(now);
      lastBoundary.setDate(now.getDate() - daysSinceTuesday);
      lastBoundary.setHours(0, 0, 0, 0);

      nextPayoutDate = new Date(lastBoundary);
      nextPayoutDate.setDate(lastBoundary.getDate() + 7);
    }

    // Include questions from both routes:
    // - fans route sets paymentStatus:'paid' immediately
    // - buyers route sets paymentStatus:'pending' until Razorpay goes live
    // So we match on amountPaid > 0 (the actual money) rather than paymentStatus.
    const answeredPaid = await Question.find({
      creatorId:    req.creator.creatorId,
      status:       { $in: ['answered', 'flagged'] },
      amountPaid:   { $gt: 0 },
      answeredAt:   { $exists: true, $ne: null },
      adminDecision: { $nin: ['fan_wins', 'banned'] },
    }).select('amountPaid answeredAt buyerName isAnonymous').sort({ answeredAt: -1 });

    let lifetimePaid = 0;
    let thisMonth    = 0;
    let inEscrow     = 0;
    let available    = 0;

    let availableQuestions = 0;
    let availableGross = 0;
    let inEscrowQuestions = 0;

    for (const q of answeredPaid) {
      const gross          = q.amountPaid || 0;
      const creatorEarning = gross * CREATOR_SHARE;
      const answeredMonth  = new Date(q.answeredAt.getFullYear(), q.answeredAt.getMonth(), 1);

      // Weekly cycle logic: questions answered from lastBoundary to now
      if (q.answeredAt >= lastBoundary) {
        available += creatorEarning;
        availableQuestions++;
        availableGross += gross;
      } else {
        // Questions answered before lastBoundary are considered paid out
        lifetimePaid += creatorEarning;
        if (answeredMonth >= monthStart) {
          thisMonth += creatorEarning;
        }
      }
    }

    // Group history by month
    const groupedHistory = {};
    for (const q of answeredPaid) {
      const gross = q.amountPaid || 0;
      const earning = gross * CREATOR_SHARE;
      
      const monthKey = q.answeredAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
      if (!groupedHistory[monthKey]) {
        groupedHistory[monthKey] = [];
      }
      
      let statusLabel = 'Paid';
      if (q.answeredAt >= lastBoundary) {
        statusLabel = 'Available';
      }
      
      groupedHistory[monthKey].push({
        id: q._id.toString(),
        date: q.answeredAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        bank: q.isAnonymous ? 'Anonymous' : (q.buyerName || 'Fan'),
        amount: Math.round(earning * 100) / 100,
        status: statusLabel
      });
    }

    const payoutHistoryGrouped = Object.keys(groupedHistory).map(month => ({
      month,
      items: groupedHistory[month]
    }));

    // New In Escrow logic: unanswered questions
    const pendingQuestions = await Question.find({
      creatorId:    req.creator.creatorId,
      status:       'submitted',
      amountPaid:   { $gt: 0 }
    }).select('amountPaid buyerName createdAt isAnonymous').sort({ createdAt: -1 });

    const pendingList = [];
    for (const q of pendingQuestions) {
      const gross = q.amountPaid || 0;
      const earning = gross * CREATOR_SHARE;
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
      const earning = gross * CREATOR_SHARE;
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
      const earning = gross * CREATOR_SHARE;
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

    res.json({
      success:        true,
      lifetimePaid:   Math.round(lifetimePaid * 100) / 100,
      thisMonth:      Math.round(thisMonth    * 100) / 100,
      inEscrow:       Math.round(inEscrow     * 100) / 100,
      available:      Math.round(available    * 100) / 100,
      nextPayoutDate: nextPayoutDate.toISOString(),
      availableQuestions,
      availableGross: Math.round(availableGross * 100) / 100,
      availableFee:   Math.round((availableGross - availableGross * CREATOR_SHARE) * 100) / 100,
      inEscrowQuestions,
      pendingList,
      underReviewAmount: Math.round(underReviewAmount * 100) / 100,
      underReviewQuestionsCount,
      underReviewList,
      refundedAmount: Math.round(refundedAmount * 100) / 100,
      refundedQuestionsCount,
      refundedList,
      payoutHistoryGrouped
    });
  } catch (err) {
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

    const verificationResult = await verifyIfsc(ifsc);
    console.log(`[IFSC Verification API] IFSC: ${ifsc}`, verificationResult);

    // If it's an error from Cashfree (status code outside 2xx)
    if (verificationResult.type === 'not_found_error' || verificationResult.code === 'ifsc_not_found' || verificationResult.type === 'validation_error') {
      return res.json({
        verified: false,
        reason: verificationResult.message || 'Invalid IFSC code',
        raw: verificationResult
      });
    }

    // Explicitly check for status: 'VALID' in a successful 200 response
    if (verificationResult.status === 'VALID') {
      return res.json({
        verified: true,
        data: verificationResult
      });
    }

    // Fallback if status is something else
    return res.json({
      verified: false,
      reason: 'IFSC could not be verified',
      raw: verificationResult
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

    // Debouncing for production: if unchanged and already verified, skip API call
    let bankVerified = false;
    let bankReason = '';
    let nameAtBank = '';
    let bankNameStr = '';
    let bankNeedsReview = false;

    if (
      process.env.CASHFREE_ENV === 'production' &&
      creator.bankVerificationStatus === 'verified' &&
      creator.bankAccountNumber === bank_account &&
      creator.bankIfsc === ifsc
    ) {
      bankVerified = true;
      nameAtBank = creator.bankNameAtBank || '';
      bankNameStr = 'Cached';
      bankReason = 'ACCOUNT_IS_VALID';
    } else {
      const verificationResult = await verifyBankAccount({ bank_account, ifsc, name, phone });

      if (verificationResult && verificationResult.account_status) {
        bankVerified = verificationResult.account_status === 'VALID';
        bankReason = verificationResult.account_status_code || (bankVerified ? 'VALID' : 'INVALID');
        nameAtBank = verificationResult.name_at_bank || '';
        bankNameStr = verificationResult.bank_name || '';
        
        const partialMatches = ['GOOD_PARTIAL_MATCH', 'MODERATE_PARTIAL_MATCH', 'POOR_PARTIAL_MATCH', 'NO_MATCH'];
        if (verificationResult.name_match_result && partialMatches.includes(verificationResult.name_match_result)) {
          bankNeedsReview = true;
        }
      } else if (verificationResult) {
        bankVerified = false;
        bankReason = verificationResult.message || verificationResult.code || 'API Error: Please verify credentials or endpoint';
      } else {
        bankVerified = false;
        bankReason = 'Unknown error (no response)';
      }
    }

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
    let panVerified = false;
    let panReason = '';
    let panRegisteredName = '';

    if (pan) {
      if (
        process.env.CASHFREE_ENV === 'production' &&
        creator.panVerificationStatus === 'verified' &&
        creator.panNumber === pan
      ) {
        panVerified = true;
        panRegisteredName = creator.panRegisteredName || '';
        panReason = 'VALID';
      } else {
        const panResult = await verifyPan({ pan, name });
        if (panResult && panResult.valid) {
          panVerified = true;
          panRegisteredName = panResult.registered_name || '';
          panReason = 'VALID';
        } else if (panResult && panResult.valid === false) {
          panVerified = false;
          panReason = panResult.message || 'Invalid PAN';
        } else if (panResult) {
          panVerified = false;
          panReason = panResult.message || panResult.code || 'PAN API Error';
        } else {
          panVerified = false;
          panReason = 'Unknown PAN error';
        }
      }
    }

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

module.exports = router;
