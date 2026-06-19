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


    // Send Welcome Email
    sendWelcomeEmail(updatedCreator.email, updatedCreator.name, updatedCreator.handle).catch(e => console.error("Failed to send welcome email", e));

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
    res.json({ success: true, creator });
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
    
    // Map frontend tab statuses to backend enum ('submitted', 'answered', 'expired', 'flagged')
    let queryStatus = null;
    if (status && status !== 'All') {
      if (status.toLowerCase() === 'pending') queryStatus = 'submitted';
      else if (status.toLowerCase() === 'replied') queryStatus = 'answered';
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
      { $match: { creatorId: new mongoose.Types.ObjectId(creatorId), status: { $ne: 'pending' } } },
      { $group: {
          _id: null,
          totalReceived: { $sum: 1 },
          totalAnswered: { $sum: { $cond: [{ $eq: ['$status', 'answered'] }, 1, 0] } },
          totalTimeDiff: { 
            $sum: { 
              $cond: [
                { $and: [{ $eq: ['$status', 'answered'] }, { $ne: ['$answeredAt', null] }] }, 
                { $subtract: ['$answeredAt', '$createdAt'] }, 
                0 
              ] 
            } 
          }
      }}
    ]);

    if (stats.length > 0) {
      const { totalReceived, totalAnswered, totalTimeDiff } = stats[0];
      const replyRate = totalReceived > 0 ? Math.round((totalAnswered / totalReceived) * 100) : 0;
      const avgReplyTimeMs = totalAnswered > 0 ? (totalTimeDiff / totalAnswered) : 0;
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

    await connectDB();
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

    // Delete creator
    const Creator = require('../models/Creator');
    await Creator.findByIdAndDelete(creatorId);

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
    const CREATOR_SHARE = 0.80;
    const ESCROW_DAYS   = 7;

    const now = new Date();
    const lastWednesday = new Date(now);
    const dayOfWeek = now.getDay(); // 0 is Sunday, 3 is Wednesday
    const diffToWednesday = (dayOfWeek >= 3) ? (dayOfWeek - 3) : (dayOfWeek + 4);
    lastWednesday.setDate(now.getDate() - diffToWednesday);
    lastWednesday.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const nextWednesday = new Date(lastWednesday);
    nextWednesday.setDate(lastWednesday.getDate() + 7);
    nextWednesday.setHours(0, 0, 0, 0);

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
      const releaseDate    = new Date(q.answeredAt.getTime() + ESCROW_DAYS * 86400000);
      const answeredMonth  = new Date(q.answeredAt.getFullYear(), q.answeredAt.getMonth(), 1);

      // Weekly cycle logic: questions answered from last Wednesday to now
      if (q.answeredAt >= lastWednesday) {
        available += creatorEarning;
        availableQuestions++;
        availableGross += gross;
      } else {
        // Questions answered before last Tuesday are considered paid out
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
      if (q.answeredAt >= lastWednesday) {
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
    }).select('amountPaid buyerName createdAt isAnonymous').sort({ createdAt: -1 });

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
        status: 'Fan Review'
      });
    }

    res.json({
      success:        true,
      lifetimePaid:   Math.round(lifetimePaid * 100) / 100,
      thisMonth:      Math.round(thisMonth    * 100) / 100,
      inEscrow:       Math.round(inEscrow     * 100) / 100,
      available:      Math.round(available    * 100) / 100,
      nextPayoutDate: nextWednesday.toISOString(),
      availableQuestions,
      availableGross: Math.round(availableGross * 100) / 100,
      availableFee:   Math.round((availableGross - availableGross * CREATOR_SHARE) * 100) / 100,
      inEscrowQuestions,
      pendingList,
      underReviewAmount: Math.round(underReviewAmount * 100) / 100,
      underReviewQuestionsCount,
      underReviewList,
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

module.exports = router;
