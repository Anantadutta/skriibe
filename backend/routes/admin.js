const express = require('express');
const router = express.Router();

/**
 * @route GET /api/admin/dashboard
 * @desc Get aggregated dashboard metrics (Platform pulse)
 */
router.get('/dashboard', (req, res) => {
  try {
    // In a real app, these would be aggregated from DB queries:
    // e.g., await Order.aggregate(...), await User.countDocuments({ role: 'creator' })
    const dashboardData = {
      gmvToday: 12400,
      revenue: 1240,
      activeCreators: 89,
      slaBreaches: 1,
      actionMetrics: {
        pendingVerify: 5,
        openQuestions: 12,
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

module.exports = router;
