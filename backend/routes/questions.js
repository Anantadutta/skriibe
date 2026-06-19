const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Question = require('../models/Question');
const Creator = require('../models/Creator');
const { sendFollowUpAskedEmail, sendNewQuestionEmail } = require('../utils/emailService');

const { verifyFanToken } = require('../middleware/auth');

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGO_URI);
};

/**
 * @route POST /api/questions
 * @desc Submit a new question from a fan to a creator
 */
router.post('/', verifyFanToken, async (req, res) => {
  try {
    const { creatorId, questionText, buyerName, buyerEmail, buyerPhone, isFollowUp, parentQuestionId } = req.body;

    if (!creatorId || !questionText) {
      return res.status(400).json({ message: 'Creator ID and question text are required.' });
    }

    if (questionText.length > 500) {
      return res.status(400).json({ message: 'Question exceeds 500 characters.' });
    }

    await connectDB();

    const Fan = require('../models/Fan');
    const fanUser = await Fan.findById(req.fan.fanId);
    if (fanUser && fanUser.isBanned) {
      let activeBan = true;
      if (fanUser.banExpiresAt && new Date(fanUser.banExpiresAt) < new Date()) {
        activeBan = false;
        fanUser.isBanned = false;
        fanUser.banExpiresAt = null;
        await fanUser.save();
      }
      if (activeBan) {
        return res.status(403).json({ message: 'Your account is currently restricted from sending questions.' });
      }
    }

    const creator = await Creator.findById(creatorId);
    if (!creator) {
      return res.status(404).json({ message: 'Creator not found.' });
    }

    if (creator.isBanned) {
      return res.status(403).json({ message: 'Creator is no longer accepting questions.' });
    }

    const activeStrikesCount = creator.strikes ? creator.strikes.filter(s => !s.isExpired).length : 0;
    if (activeStrikesCount === 3 && creator.suspensionUntil && new Date() < new Date(creator.suspensionUntil)) {
      return res.status(403).json({ message: 'Creator is temporarily unable to accept new questions. Please try again later.' });
    }

    const newQuestion = new Question({
      creatorId: creator._id,
      handle: creator.handle,
      fanId: req.fan.fanId,
      buyerName: buyerName || req.fan.name || req.fan.email,
      buyerEmail: buyerEmail || req.fan.email,
      buyerPhone: buyerPhone || '',
      questionText,
      amountPaid: isFollowUp ? 0 : (creator.pricePerQuestion || creator.price || 99),
      paymentStatus: 'paid', // Dummy payment status for now
      status: 'submitted',
      expiresAt: new Date(Date.now() + (parseInt(creator.responseTime) || 48) * 60 * 60 * 1000),
      isFollowUp: !!isFollowUp,
      parentQuestionId: isFollowUp ? parentQuestionId : undefined,
    });

    await newQuestion.save();

    if (creator.email) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const dashboardLink = `${frontendUrl}/creator/dashboard/reply/${newQuestion._id}`;
      
      if (isFollowUp) {
        sendFollowUpAskedEmail(creator.email, buyerName || req.fan.name || 'A Fan', creator.name || creator.handle, dashboardLink)
          .catch(e => console.error("Failed to send follow up asked email", e));
      } else {
        const amount = creator.pricePerQuestion || creator.price || 99;
        sendNewQuestionEmail(creator.email, buyerName || req.fan.name || 'A Fan', creator.name || creator.handle, dashboardLink, amount)
          .catch(e => console.error("Failed to send new question email", e));
      }
    }

    res.status(201).json({ 
      success: true, 
      message: 'Question sent successfully!',
      question: newQuestion,
      avgReplyTime: creator.responseTime || '48 hours'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/questions/fan-history
 * @desc Get all questions asked by the logged in fan
 */
router.get('/fan-history', verifyFanToken, async (req, res) => {
  try {
    await connectDB();
    const questions = await Question.find({ fanId: req.fan.fanId })
      .populate('creatorId', 'name avatarUrl handle')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/questions/notifications
 * @desc Get all notifications for the logged in fan
 */
router.get('/notifications', verifyFanToken, async (req, res) => {
  try {
    await connectDB();
    const Notification = require('../models/Notification');
    const Question = require('../models/Question');
    const Creator = require('../models/Creator');
    
    let notifications = await Notification.find({ fanId: req.fan.fanId }).sort({ createdAt: -1 });
    
    // Auto-fix any existing '@undefined' notifications in the DB
    let modified = false;
    for (let notif of notifications) {
      if (notif.message && notif.message.includes('@undefined')) {
        const q = await Question.findById(notif.questionId);
        if (q) {
          const creator = await Creator.findById(q.creatorId);
          if (creator) {
            notif.message = notif.message.replace('@undefined', creator.name || creator.handle || 'A creator');
            await notif.save();
            modified = true;
          }
        }
      }
    }
    
    if (modified) {
      notifications = await Notification.find({ fanId: req.fan.fanId }).sort({ createdAt: -1 });
    }

    res.status(200).json({ success: true, notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/questions/unread-count
 * @desc Get number of unread answered questions for fan
 */
router.get('/unread-count', verifyFanToken, async (req, res) => {
  try {
    await connectDB();
    const count = await Question.countDocuments({
      fanId: req.fan.fanId,
      status: 'answered',
      fanRead: false
    });
    res.status(200).json({ success: true, count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route PATCH /api/questions/notifications/:id/read
 * @desc Mark a notification as read
 */
router.patch('/notifications/:id/read', verifyFanToken, async (req, res) => {
  try {
    const { id } = req.params;
    await connectDB();
    const Notification = require('../models/Notification');
    const notification = await Notification.findOneAndUpdate(
      { _id: id, fanId: req.fan.fanId },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json({ success: true, notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/questions/:id/read
 * @desc Mark a question as read by fan
 */
router.post('/:id/read', verifyFanToken, async (req, res) => {
  try {
    const { id } = req.params;
    await connectDB();
    const question = await Question.findOneAndUpdate(
      { _id: id, fanId: req.fan.fanId },
      { fanRead: true },
      { new: true }
    );
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.status(200).json({ success: true, question });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
