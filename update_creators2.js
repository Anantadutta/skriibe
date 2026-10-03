const fs = require('fs');
let content = fs.readFileSync('backend/routes/creators.js', 'utf8');

const replacement = `const earningsPerCreator = {};
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

content = content.replace(/const earningsPerCreator = {};[\s\S]*?if \(q\) {[\s\S]*?const referredId = q\.creatorId\.toString\(\);[\s\S]*?earningsPerCreator\[referredId\] = \(earningsPerCreator\[referredId\] \|\| 0\) \+ \(e\.amount \|\| 0\);[\s\S]*?}[\s\S]*?}/, replacement);

fs.writeFileSync('backend/routes/creators.js', content);
