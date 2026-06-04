const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Creator = require('../models/Creator');
const Fan = require('../models/Fan');
const Question = require('../models/Question');

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

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const openQuestionsCount = await Question.countDocuments({
      status: 'submitted',
      paymentStatus: 'paid'
    });

    const dashboardData = {
      gmvToday: 12400,
      revenue: 1240,
      activeCreators: 89,
      slaBreaches: 1,
      actionMetrics: {
        openQuestions: openQuestionsCount,
        refundsToday: 2
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
 * @desc Get all creators
 */
router.get('/creators', async (req, res) => {
  try {
    await connectDB();
    const creators = await Creator.find({}).sort({ createdAt: -1 });
    res.json(creators);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching creators' });
  }
});

/**
 * @route GET /api/admin/fans
 * @desc Get all fans
 */
router.get('/fans', async (req, res) => {
  try {
    await connectDB();
    const fans = await Fan.find({}).sort({ createdAt: -1 });
    res.json(fans);
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
    const openQuestions = await Question.find({ status: 'submitted', paymentStatus: 'paid' })
      .populate('creatorId', 'name handle avatarUrl email')
      .sort({ createdAt: 1 }); // Oldest first
    res.json(openQuestions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.toString(), stack: err.stack });
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

module.exports = router;
