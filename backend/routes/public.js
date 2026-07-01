/**
 * @module public — Unauthenticated routes for buyer-facing pages on skriibe
 */
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Creator = require('../models/Creator');
const Question = require('../models/Question');

router.get('/debug-questions', async (req, res) => {
  try {
    const questions = await Question.find({});
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ConnectDB helper since this is how the prompt structure implies connections might be done inside the route
// But usually mongoose handles it globally. We will just use standard query execution.
// If the app uses a serverless connectDB, we assume it's already connected by index/server,
// but the prompt specified `await connectDB()`. I'll create a dummy or rely on global.

// GET /api/public/creator/:handle
// Returns creator profile for the public buyer page — no auth required
router.get('/creator/:handle', async (req, res) => {
  try {
    let { handle } = req.params;
    if (handle.startsWith('@')) {
      handle = handle.substring(1);
    }
    const creator = await Creator.findOne({ handle: new RegExp(`^${handle}$`, 'i') }).select(
      'name handle avatarUrl bio expertise stats instagramHandle instagramFollowers price pricePerQuestion responseTime questionsAnswered instagramConnected isLive isPaused'
    );
    if (!creator) {
      return res.status(404).json({ success: false, message: 'Creator not found' });
    }
    const answeredCount = await Question.countDocuments({ creatorId: creator._id, status: { $in: ['answered', 'satisfied', 'rejected'] } });
    return res.json({
      success: true,
      creator: {
        id: creator._id,
        name: creator.name,
        handle: creator.handle,
        avatarUrl: creator.avatarUrl,
        bio: creator.bio || '',
        expertise: creator.expertise || [],
        stats: {
          ...(creator.stats || { replyRate: 0, avgReplyTime: 0 }),
          totalAnswered: answeredCount
        },
        instagramHandle: creator.instagramHandle || '',
        followers: creator.instagramFollowers || 0,
        price: creator.price || creator.pricePerQuestion,
        pricePerQuestion: creator.price || creator.pricePerQuestion,
        responseTime: creator.responseTime || '48 hours',
        questionsAnswered: answeredCount,
        instagramLinked: creator.instagramConnected,
        isLive: creator.isLive,
        isPaused: creator.isPaused || false,
      },
    });
  } catch (err) {
    console.error('Public route error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/public/creators
// Returns creators with optional filtering: ?live=true, ?category=Tech, ?search=query
router.get('/creators', async (req, res) => {
  try {
    const { live, category, search } = req.query;
    let query = { 
      isPaused: { $ne: true },
      isBanned: { $ne: true },
      handle: { $exists: true, $nin: [null, ''] },
      $or: [
        { suspensionUntil: { $exists: false } },
        { suspensionUntil: null },
        { suspensionUntil: { $lte: new Date() } }
      ]
    };
    const PREDEFINED_CATEGORIES = [
      'Career & Finance', 'Health & Fitness', 'Tech & Skills', 
      'Fashion & Lifestyle', 'Daily Vlogs & Entertainment', 
      'Education', 'Business & Entrepreneurship', 'Relationships & Life', 
      'Spirituality'
    ];
    
    if (live === 'true') query.isLive = true;
    if (category === 'Others') {
      query.expertise = { $elemMatch: { $nin: PREDEFINED_CATEGORIES } };
    } else if (category) {
      query.expertise = category;
    }
    
    if (search) {
      const cleanSearch = search.replace(/^@/, '');
      query.$or = [
        { name: { $regex: cleanSearch, $options: 'i' } },
        { handle: { $regex: cleanSearch, $options: 'i' } },
        { instagramHandle: { $regex: cleanSearch, $options: 'i' } }
      ];
    }

    const creators = await Creator.find(query).select(
      'name handle avatarUrl bio expertise price pricePerQuestion responseTime stats verified instagramFollowers instagramConnected isLive isPaused'
    ).lean();
    
    // Sort: Live creators first, then by replyRate descending
    creators.sort((a, b) => {
      if (a.isLive === b.isLive) {
        return (b.stats?.replyRate || 0) - (a.stats?.replyRate || 0);
      }
      return a.isLive ? -1 : 1;
    });
    
    const formattedCreators = creators.map(c => ({
      id: c._id,
      name: c.name || 'Anonymous',
      handle: c.handle || 'unknown',
      avatarUrl: c.avatarUrl || '',
      bio: c.bio || '',
      expertise: c.expertise || [],
      price: c.price || c.pricePerQuestion,
      pricePerQuestion: c.price || c.pricePerQuestion,
      responseTime: c.responseTime || '48 hours',
      stats: {
        totalAnswered: c.stats?.totalAnswered || 0,
        replyRate: c.stats?.replyRate ?? 0,
        avgReplyTime: c.stats?.avgReplyTime || 0
      },
      verified: c.verified || false,
      isLive: c.isLive || false,
      isPaused: c.isPaused || false
    }));

    return res.json({
      success: true,
      creators: formattedCreators
    });
  } catch (err) {
    console.error('Fetch live creators error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
