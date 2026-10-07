const fs = require('fs');
let content = fs.readFileSync('backend/routes/creators.js', 'utf8');

const targetStr = `const earningsPerCreator = {};
    for (const e of affiliateEarnings) {
      if (!e.questionId) continue;
      const q = await Question.findById(e.questionId).select('creatorId');
      if (q) {
        const referredId = q.creatorId.toString();
        earningsPerCreator[referredId] = (earningsPerCreator[referredId] || 0) + (e.amount || 0);
      }
    }`;

const newStr = `const earningsPerCreator = {};
    const ChatSession = require('../models/ChatSession');
    for (const e of affiliateEarnings) {
      if (!e.questionId) continue;
      
      let q = await Question.findById(e.questionId).select('creatorId');
      if (!q) {
          q = await ChatSession.findById(e.questionId).select('creatorId');
      }
      
      if (q) {
        const referredId = q.creatorId.toString();
        earningsPerCreator[referredId] = (earningsPerCreator[referredId] || 0) + (e.amount || 0);
      }
    }`;

content = content.replace(targetStr, newStr);

fs.writeFileSync('backend/routes/creators.js', content);
