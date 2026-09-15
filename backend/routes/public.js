/**
 * @module public — Unauthenticated routes for buyer-facing pages on skriibe
 */
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Creator = require('../models/Creator');
const Question = require('../models/Question');
const { normalizeExpertiseList, EXPERTISE_MAPPING } = require('../utils/expertiseConstants');

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
      'name handle avatarUrl bio expertise stats instagramHandle instagramFollowers price pricePerQuestion responseTime questionsAnswered instagramConnected isLive isPaused liveChatEnabled liveChatPrice liveChatTimeSlots ama_enabled'
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
        expertise: normalizeExpertiseList(creator.expertise || []),
        stats: {
          ...(creator.stats || { replyRate: 100, avgReplyTime: 0 }),
          totalAnswered: answeredCount
        },
        instagramHandle: creator.instagramHandle || '',
        instagramFollowers: creator.instagramFollowers ?? null,
        price: creator.price || creator.pricePerQuestion,
        pricePerQuestion: creator.price || creator.pricePerQuestion,
        responseTime: creator.responseTime || '48 hours',
        questionsAnswered: answeredCount,
        instagramLinked: creator.instagramConnected,
        isLive: creator.isLive,
        isPaused: creator.isPaused || false,
        liveChatEnabled: creator.liveChatEnabled || false,
        liveChatPrice: creator.liveChatPrice || 5,
        liveChatTimeSlots: creator.liveChatTimeSlots || [],
        ama_enabled: creator.ama_enabled
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
      isBanned: { $ne: true },
      handle: { $exists: true, $nin: [null, ''] },
      name: { $exists: true, $nin: [null, ''] },
      $or: [
        { suspensionUntil: { $exists: false } },
        { suspensionUntil: null },
        { suspensionUntil: { $lte: new Date() } }
      ]
    };
    const PREDEFINED_CATEGORIES = [
      'Lifestyle', 'Beauty', 'Fitness', 'Finance', 'Tech',
      'Entrepreneurship', 'Education', 'Motivation', 'Dating',
      'Food', 'Travel', 'Music', 'Gaming', 'Comedy'
    ];
    
    if (live === 'true') query.isLive = true;
    if (category === 'Others') {
      const allKnown = new Set([
        ...PREDEFINED_CATEGORIES.map(c => c.toLowerCase()),
        ...Object.keys(EXPERTISE_MAPPING)
      ]);
      query.expertise = { $elemMatch: { $nin: Array.from(allKnown).map(k => new RegExp(`^${k}$`, 'i')) } };
    } else if (category && category !== 'All Categories' && category !== 'All') {
      const aliases = Object.entries(EXPERTISE_MAPPING)
        .filter(([k, v]) => v.toLowerCase() === category.toLowerCase())
        .map(([k]) => new RegExp(`^${k}$`, 'i'));
      query.expertise = { $in: [category, ...aliases] };
    }
    
    if (search) {
      const cleanSearch = search.replace(/^@/, '');
      const lowerSearch = cleanSearch.toLowerCase();
      
      const searchKeywordsMapping = {
        'entrepreneur': 'Entrepreneurship',
        'startup': 'Entrepreneurship',
        'founder': 'Entrepreneurship',
        'startups': 'Entrepreneurship',
        'money': 'Finance',
        'investing': 'Finance',
        'investment': 'Finance',
        'wealth': 'Finance',
        'workout': 'Fitness',
        'gym': 'Fitness',
        'health': 'Fitness',
        'skincare': 'Beauty',
        'makeup': 'Beauty',
        'recipes': ['Cooking', 'Food'],
        'chef': ['Cooking', 'Food'],
        'restaurants': 'Food',
        'holidays': 'Travel',
        'trips': 'Travel',
        'songs': 'Music',
        'singer': 'Music',
        'games': 'Gaming',
        'gamer': 'Gaming',
        'jokes': 'Comedy',
        'relationships': 'Dating',
        'love': 'Dating',
        'study': 'Education',
        'learning': 'Education',
        'inspiration': 'Motivation',
        'self-help': 'Motivation'
      };

      const matchedExpertises = [];
      for (const [key, value] of Object.entries(searchKeywordsMapping)) {
        if (lowerSearch.includes(key)) {
          if (Array.isArray(value)) {
            matchedExpertises.push(...value);
          } else {
            matchedExpertises.push(value);
          }
        }
      }

      const orConditions = [
        { name: { $regex: cleanSearch, $options: 'i' } },
        { handle: { $regex: cleanSearch, $options: 'i' } },
        { instagramHandle: { $regex: cleanSearch, $options: 'i' } },
        { expertise: { $regex: cleanSearch, $options: 'i' } }
      ];

      if (matchedExpertises.length > 0) {
        matchedExpertises.forEach(exp => {
          orConditions.push({ expertise: { $regex: exp, $options: 'i' } });
        });
      }

      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: orConditions }];
        delete query.$or;
      } else {
        query.$or = orConditions;
      }
    }

    const creators = await Creator.find(query).select(
      'name handle avatarUrl profileUrl bio expertise price pricePerQuestion responseTime stats verified instagramFollowers instagramConnected isLive isPaused liveChatEnabled liveChatPrice liveChatTimeSlots ama_enabled'
    ).lean();

    // Creators currently mid-chat. Mirrors the "live session" shape used elsewhere:
    // creatorJoined doubles as a dismissal marker, so ended/cancelled ones must be excluded.
    const ChatSession = require('../models/ChatSession');
    const busyCreatorIds = await ChatSession.distinct('creatorId', {
      status: 'active',
      creatorJoined: true,
      cancelledByFan: { $ne: true },
      $or: [{ endTime: null }, { endTime: { $exists: false } }]
    });
    const busyCreatorSet = new Set(busyCreatorIds.map(String));
    
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
      avatarUrl: c.avatarUrl || c.profileUrl || '',
      profileUrl: c.profileUrl || '',
      bio: c.bio || '',
      expertise: normalizeExpertiseList(c.expertise || []),
      price: c.price || c.pricePerQuestion,
      pricePerQuestion: c.price || c.pricePerQuestion,
      responseTime: c.responseTime || '48 hours',
      stats: {
        totalAnswered: c.stats?.totalAnswered || 0,
        replyRate: c.stats?.replyRate ?? 100,
        avgReplyTime: c.stats?.avgReplyTime || 0
      },
      verified: c.verified || false,
      isLive: c.isLive,
      isPaused: c.isPaused || false,
      instagramFollowers: c.instagramFollowers,
      liveChatEnabled: c.liveChatEnabled || false,
      liveChatPrice: c.liveChatPrice || 5,
      liveChatTimeSlots: c.liveChatTimeSlots || [],
      ama_enabled: c.ama_enabled,
      inSession: busyCreatorSet.has(String(c._id))
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

// Temp route to fix legacy 0 reply rate
router.get('/fix-stats', async (req, res) => {
  try {
    const result = await Creator.updateMany(
      { 'stats.replyRate': 0 },
      { $set: { 'stats.replyRate': 100 } }
    );
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
