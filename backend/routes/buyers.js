/**
 * @module buyers — Buyer OTP verification and question submission for skriibe
 */
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const crypto = require('crypto');
const AdminAlert = require('../models/AdminAlert');
const { sendOTPviaMSG91 } = require('../utils/smsService');
const Creator = require('../models/Creator');
const Question = require('../models/Question');
const jwt = require('jsonwebtoken');

// In-memory OTP store (replace with Redis in production)
const otpStore = {};

// POST /api/buyers/send-otp
// Body: { phone } — sends OTP to buyer's mobile via MSG91
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Enter a valid 10-digit mobile number' });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    otpStore[phone] = { otp, expiresAt };

    await sendOTPviaMSG91(phone, otp); // uses MSG91_AUTH_KEY + MSG91_TEMPLATE_ID from .env

    return res.json({ success: true, message: 'OTP sent' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// POST /api/buyers/verify-otp
// Body: { phone, otp } — verifies OTP, returns a short-lived buyer session token
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const record = otpStore[phone];
    if (!record) return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });
    if (Date.now() > record.expiresAt) {
      delete otpStore[phone];
      return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });
    }
    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP' });
    }
    delete otpStore[phone];
    // Issue a short-lived buyer verification token (not stored in cookie — just returned to frontend)
    const buyerToken = jwt.sign({ phone, verified: true }, process.env.JWT_SECRET || 'secret', { expiresIn: '30m' });
    return res.json({ success: true, buyerToken });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

// POST /api/buyers/submit-question
// Body: { creatorHandle, questionText, buyerName, buyerPhone, buyerEmail, isAnonymous }
router.post('/submit-question', async (req, res) => {
  try {
    const { creatorHandle, questionText, buyerName, buyerPhone, buyerEmail, isAnonymous } = req.body;

    if (!buyerPhone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    // Validate question
    if (!questionText || questionText.trim().length < 20) {
      return res.status(400).json({ success: false, message: 'Question must be at least 20 characters' });
    }
    if (questionText.trim().length > 500) {
      return res.status(400).json({ success: false, message: 'Question must be under 500 characters' });
    }

    // Find creator
    const creator = await Creator.findOne({ handle: creatorHandle.toLowerCase(), ama_enabled: true });
    if (!creator) {
      return res.status(404).json({ success: false, message: 'Creator not found' });
    }

    // Calculate SLA deadline
    const responseHours = parseInt(creator.responseTime) || 48; // e.g. "48 hours" → 48
    const expiresAt = new Date(Date.now() + responseHours * 60 * 60 * 1000);

    // Create question (payment pending — Razorpay in Phase 4)
    const question = await Question.create({
      creatorId: creator._id,
      handle: creator.handle,
      buyerName: isAnonymous ? 'Anonymous' : (buyerName || ''),
      buyerPhone: buyerPhone,
      buyerEmail: buyerEmail || '',
      isAnonymous: !!isAnonymous,
      questionText: questionText.trim(),
      amountPaid: creator.pricePerQuestion || creator.price || 99,
      paymentStatus: 'pending', // Updated to 'paid' after Razorpay in Phase 4
      status: 'submitted',
      expiresAt,
    });

    return res.json({
      success: true,
      questionId: question._id,
      message: 'Question submitted! Payment integration coming in Phase 4.',
    });
  } catch (err) {
    console.error('submit-question error:', err.message);
    return res.status(500).json({ success: false, message: 'Submission failed' });
  }
});

// POST /api/buyers/create-order
// Body: { questionId, amount }
router.post('/create-order', async (req, res) => {
  const { questionId, amount } = req.body;
  // const order = await createOrder(amount, 'INR', `question_${questionId}`);
  // res.json({ orderId: order.id });
  res.json({ orderId: 'mock_order_id' }); // Mocked for now
});

// GET /api/buyers/history/:phone
// Fetch all questions submitted by a specific phone number
router.get('/history/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number required' });
    }
    const questions = await Question.find({ buyerPhone: phone }).sort({ createdAt: -1 });
    return res.json({ success: true, questions });
  } catch (err) {
    console.error('history error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch history' });
  }
});

// GET /api/buyers/question/:id
// Fetch a single question by its ID
router.get('/question/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid question ID' });
    }
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    return res.json({ success: true, question });
  } catch (err) {
    console.error('get-question error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch question' });
  }
});

// POST /api/buyers/question/:id/flag
// Flags an answered question as incomplete
router.post('/question/:id/flag', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid question ID' });
    }
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    
    question.status = 'flagged';
    if (reason) question.flagReason = reason;
    await question.save();
    
    await AdminAlert.create({
      type: 'buyer_flag',
      title: 'Fan flagged question',
      message: `Fan flagged answered question #${question._id.toString().slice(-6)}.`,
      referenceId: question._id
    });

    return res.json({ success: true, message: 'Question flagged successfully', question });
  } catch (err) {
    console.error('flag-question error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to flag question' });
  }
});

module.exports = router;
