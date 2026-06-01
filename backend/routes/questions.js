const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Question = require('../models/Question');
const Creator = require('../models/Creator');

// Middleware to verify fan JWT
const verifyFanToken = (req, res, next) => {
  const token = req.cookies.fan_token;
  if (!token) return res.status(401).json({ message: 'Unauthorized. Please login as a Fan.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (decoded.role !== 'fan') return res.status(403).json({ message: 'Forbidden. Only fans can ask questions.' });
    req.fan = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

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
    const { creatorId, questionText, buyerName, buyerEmail, buyerPhone } = req.body;

    if (!creatorId || !questionText) {
      return res.status(400).json({ message: 'Creator ID and question text are required.' });
    }

    if (questionText.length > 500) {
      return res.status(400).json({ message: 'Question exceeds 500 characters.' });
    }

    await connectDB();

    const creator = await Creator.findById(creatorId);
    if (!creator) {
      return res.status(404).json({ message: 'Creator not found.' });
    }

    const newQuestion = new Question({
      creatorId: creator._id,
      handle: creator.handle,
      fanId: req.fan.fanId,
      buyerName: buyerName || req.fan.name || req.fan.email,
      buyerEmail: buyerEmail || req.fan.email,
      buyerPhone: buyerPhone || '',
      questionText,
      amountPaid: creator.pricePerQuestion || creator.price || 99,
      paymentStatus: 'paid', // Dummy payment status for now
      status: 'submitted'
    });

    await newQuestion.save();

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

module.exports = router;
