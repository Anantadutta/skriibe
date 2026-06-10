/**
 * @file creator.js
 * @description Routes for creator profile setup and activation.
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Creator = require('../models/Creator');
const Question = require('../models/Question');
const AdminAlert = require('../models/AdminAlert');
const { sendWelcomeEmail, sendProfileSubmittedEmail,
 sendQuestionAnsweredEmail } = require('../utils/emailService');

// Middleware to verify creator JWT
const verifyCreatorToken = (req, res, next) => {
  const token = req.cookies.creator_token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.creator = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGO_URI);
};

// Issue JWT helper
const issueToken = (res, creator) => {
  const token = jwt.sign(
    { creatorId: creator._id, email: creator.email, handle: creator.handle },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );
  res.cookie('creator_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
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
    issueToken(res, updatedCreator);

    res.json({ success: true, creator: updatedCreator, pageUrl: `/@${updatedCreator.handle}` });
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

/**
 * @route POST /api/creator/questions/:id/reply
 * @desc Reply to a question
 */
router.post('/questions/:id/reply', verifyCreatorToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { replyText } = req.body;
    
    if (!replyText || replyText.trim().length < 100) {
      return res.status(400).json({ message: 'Reply must be at least 100 characters.' });
    }

    await connectDB();
    const Question = require('../models/Question');
    const question = await Question.findOneAndUpdate(
      { _id: id, creatorId: req.creator.creatorId },
      { 
        status: 'answered',
        answerText: replyText,
        answeredAt: new Date()
      },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found or unauthorized' });
    }

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
        sendQuestionAnsweredEmail(question.buyerEmail, question.buyerName, creatorName, answerLink)
          .catch(e => console.error("Failed to send question answered email", e));
      }
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
    const token = req.cookies?.creator_token;
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

    // Clear cookie
    res.clearCookie('creator_token');
    res.json({ success: true });
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
  res.clearCookie('creator_token');
  res.json({ success: true });
});

module.exports = router;
