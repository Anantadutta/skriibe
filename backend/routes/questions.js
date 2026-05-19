/**
 * @file questions.js
 * @description Routes for question validation and moderation.
 */

const express = require('express');
const router = express.Router();

const BANNED_KEYWORDS = ['fuck', 'shit', 'porn', 'sex', 'nude', 'naked', 'kill', 'rape', 'drugs', 'cocaine', 'terrorist', 'bomb'];

const PII_PATTERNS = {
  aadhaar: /\b\d{4}\s\d{4}\s\d{4}\b/,
  phone: /\b[6-9]\d{9}\b/,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
};

/**
 * @route POST /api/questions/validate
 * @desc Public route to validate question content
 */
router.post('/validate', (req, res) => {
  const { questionText } = req.body;

  if (!questionText) {
    return res.status(400).json({ allowed: false, reason: 'Question text is required' });
  }

  const lowerText = questionText.toLowerCase();

  // Check banned keywords
  for (const word of BANNED_KEYWORDS) {
    if (lowerText.includes(word)) {
      return res.status(400).json({ allowed: false, reason: 'Question contains inappropriate content' });
    }
  }

  // Check PII
  if (PII_PATTERNS.aadhaar.test(questionText) || PII_PATTERNS.phone.test(questionText) || PII_PATTERNS.email.test(questionText)) {
    return res.status(400).json({ 
      allowed: false, 
      reason: 'Please do not share personal information like phone numbers, emails, or Aadhaar numbers' 
    });
  }

  res.json({ allowed: true });
});

module.exports = router;
