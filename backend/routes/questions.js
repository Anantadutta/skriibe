const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Question = require('../models/Question');
const Creator = require('../models/Creator');
const Counter = require('../models/Counter');
const Order = require('../models/Order');
const WalletTransaction = require('../models/WalletTransaction');
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
    let fanUser = null;
    let fanId = req.fan?.fanId;
    if (fanId) {
      fanUser = await Fan.findById(fanId);
    }
    if (!fanUser && (req.fan?.email || buyerEmail)) {
      fanUser = await Fan.findOne({ email: (req.fan?.email || buyerEmail).toLowerCase() });
      if (fanUser) fanId = fanUser._id;
    }
    if (!fanUser && req.fan?.creatorId) {
      const Creator = require('../models/Creator');
      const creatorAcc = await Creator.findById(req.fan.creatorId);
      if (creatorAcc?.fanId) {
        fanUser = await Fan.findById(creatorAcc.fanId);
        if (fanUser) fanId = fanUser._id;
      } else if (creatorAcc?.email) {
        fanUser = await Fan.findOne({ email: creatorAcc.email.toLowerCase() });
        if (fanUser) fanId = fanUser._id;
      }
    }

    let amountToDeduct = 0;
    
    const creator = await Creator.findById(creatorId);
    if (!creator) {
      return res.status(404).json({ message: 'Creator not found.' });
    }

    if (!isFollowUp) {
      amountToDeduct = creator.pricePerQuestion || creator.price || 10;
    }

    if (fanUser) {
      if (fanUser.isBanned) {
        return res.status(403).json({ message: 'Your account is permanently restricted from sending questions.' });
      }
      if (fanUser.banExpiresAt) {
        if (new Date(fanUser.banExpiresAt) > new Date()) {
          return res.status(403).json({ message: 'Your account is temporarily restricted from sending questions.' });
        } else {
          fanUser.banExpiresAt = null;
        }
      }
      
      if (!isFollowUp && (fanUser.walletBalance || 0) < amountToDeduct) {
        return res.status(400).json({ message: 'Insufficient wallet balance.', requiresRecharge: true });
      }

      if (!isFollowUp && amountToDeduct > 0) {
        fanUser.walletBalance = Math.max(0, (fanUser.walletBalance || 0) - amountToDeduct);
      }

      if (buyerPhone && !fanUser.whatsappPhone && !fanUser.phone) {
        fanUser.whatsappPhone = buyerPhone;
      }
      await fanUser.save();
    }

    if (creator.isBanned) {
      return res.status(403).json({ message: 'Creator is no longer accepting questions.' });
    }

    const activeStrikesCount = creator.strikes ? creator.strikes.filter(s => !s.isExpired).length : 0;
    if (activeStrikesCount === 3 && creator.suspensionUntil && new Date() < new Date(creator.suspensionUntil)) {
      return res.status(403).json({ message: 'Creator is temporarily unable to accept new questions. Please try again later.' });
    }

    const counter = await Counter.findByIdAndUpdate(
      { _id: 'questionOrderNumber' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const orderNumber = 'SKR-' + (10000000 + counter.seq);

    const newQuestion = new Question({
      creatorId: creator._id,
      handle: creator.handle,
      fanId: fanId || fanUser?._id,
      buyerName: buyerName || req.fan.name || req.fan.email,
      buyerEmail: buyerEmail || req.fan.email,
      buyerPhone: buyerPhone || '',
      questionText,
      amountPaid: isFollowUp ? 0 : amountToDeduct,
      paymentStatus: 'paid', // Dummy payment status for now
      status: 'submitted',
      expiresAt: new Date(Date.now() + (parseInt(creator.responseTime) || 48) * 60 * 60 * 1000),
      isFollowUp: !!isFollowUp,
      parentQuestionId: isFollowUp ? parentQuestionId : undefined,
      orderNumber,
    });

    await newQuestion.save();

    if (!isFollowUp && amountToDeduct > 0 && (fanId || fanUser?._id)) {
      try {
        const tx = new WalletTransaction({
          fanId: fanId || fanUser._id,
          creatorId: creator._id,
          amount: amountToDeduct,
          type: 'debit',
          reference: newQuestion._id.toString(),
          status: 'completed',
          description: `AMA • ${creator.name || creator.handle || 'Creator'}`
        });
        await tx.save();
      } catch (txErr) {
        console.error('Failed to create wallet transaction for question:', txErr);
      }
    }

    const newOrder = new Order({
      orderNumber: orderNumber,
      questionId: newQuestion._id,
      fanName: buyerName || req.fan.name || req.fan.email,
      creatorHandle: creator.handle,
      amountPaid: newQuestion.amountPaid,
      status: 'paid'
    });
    await newOrder.save();

    if (creator.email) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const dashboardLink = `${frontendUrl}/creator/dashboard/reply/${newQuestion._id}`;
      
      if (isFollowUp) {
        sendFollowUpAskedEmail(creator.email, buyerName || req.fan.name || 'A Fan', creator.name || creator.handle, dashboardLink)
          .catch(e => console.error("Failed to send follow up asked email", e));
      } else {
        const amount = creator.pricePerQuestion || creator.price || 0;
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

    if (req.io) {
      req.io.to(`creator_${creatorId}`).emit('new-question', { question: newQuestion });
      req.io.emit('new-question', { creatorId, questionId: newQuestion._id });
    }

    // Update Creator Stats asynchronously
    (async () => {
      try {
        const stats = await Question.aggregate([
          { $match: { creatorId: new mongoose.Types.ObjectId(creatorId) } },
          { $group: {
              _id: null,
              totalReceived: { $sum: 1 },
              totalPending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
              totalFlagged: { $sum: { $cond: [{ $eq: ['$status', 'flagged'] }, 1, 0] } },
              totalAnswered: { $sum: { $cond: [{ $in: ['$status', ['answered', 'satisfied', 'rejected']] }, 1, 0] } }
          }}
        ]);
        if (stats.length > 0) {
          const { totalReceived, totalPending, totalFlagged, totalAnswered } = stats[0];
          const denominator = totalReceived - totalPending - totalFlagged;
          const replyRate = denominator > 0 ? Math.round((totalAnswered / denominator) * 100) : 100;
          await Creator.findByIdAndUpdate(creatorId, {
            'stats.totalAnswered': totalAnswered,
            'stats.replyRate': replyRate,
            questionsAnswered: totalAnswered
          });
        }
      } catch (e) {
        console.error("Failed to update creator stats on new question:", e);
      }
    })();

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
    const questions = await Question.find({ fanId: req.fan.fanId, deletedByFan: { $ne: true } })
      .populate('creatorId', 'name avatarUrl handle')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route DELETE /api/questions/:id/history
 * @desc Hide a question from fan's history
 */
router.delete('/:id/history', verifyFanToken, async (req, res) => {
  try {
    await connectDB();
    const question = await Question.findOne({ _id: req.params.id, fanId: req.fan.fanId });
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    await Question.updateOne({ _id: question._id }, { $set: { deletedByFan: true } });
    res.status(200).json({ success: true, message: 'Question history deleted successfully' });
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
    const Notification = require('../models/Notification');
    const count = await Notification.countDocuments({
      fanId: req.fan.fanId,
      isRead: false
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
