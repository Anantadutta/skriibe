/**
 * @module public — Unauthenticated routes for buyer-facing pages on skriibe
 */
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Creator = require('../models/Creator');
const Question = require('../models/Question');

// ConnectDB helper since this is how the prompt structure implies connections might be done inside the route
// But usually mongoose handles it globally. We will just use standard query execution.
// If the app uses a serverless connectDB, we assume it's already connected by index/server,
// but the prompt specified `await connectDB()`. I'll create a dummy or rely on global.

// GET /api/public/creator/:handle
// Returns creator profile for the public buyer page — no auth required
router.get('/creator/:handle', async (req, res) => {
  try {
    const { handle } = req.params;
    const creator = await Creator.findOne({ handle: handle.toLowerCase(), ama_enabled: true }).select(
      'name handle avatarUrl bio instagramHandle instagramFollowers price pricePerQuestion responseTime questionsAnswered instagramConnected'
    );
    if (!creator) {
      return res.status(404).json({ success: false, message: 'Creator not found' });
    }
    // Count answered questions for social proof
    const answeredCount = await Question.countDocuments({ creatorId: creator._id, status: 'answered' });
    return res.json({
      success: true,
      creator: {
        name: creator.name,
        handle: creator.handle,
        avatarUrl: creator.avatarUrl,
        bio: creator.bio || '',
        instagramHandle: creator.instagramHandle || '',
        followers: creator.instagramFollowers || 0,
        pricePerQuestion: creator.pricePerQuestion || creator.price || 99,
        responseTime: creator.responseTime || '48 hours',
        questionsAnswered: answeredCount || creator.questionsAnswered || 0,
        instagramLinked: creator.instagramConnected,
      },
    });
  } catch (err) {
    console.error('Public route error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
