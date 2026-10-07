const fs = require('fs');
let content = fs.readFileSync('backend/utils/socketHandlers.js', 'utf8');

// 1. Add require statement at top
if (!content.includes('processAffiliateEarning')) {
  content = content.replace(/const ChatSession = require\('\.\.\/models\/ChatSession'\);/, `const ChatSession = require('../models/ChatSession');\nconst { processAffiliateEarning } = require('./affiliateEarning');`);
}

// 2. Add affiliate earning logic after session.endReason = reason || 'SYSTEM_END'; await session.save();
const targetStr = `session.endReason = reason || 'SYSTEM_END';\n        await session.save();`;
const newStr = `session.endReason = reason || 'SYSTEM_END';\n        await session.save();\n\n        if (session.totalCost > 0) {\n          await processAffiliateEarning(\n            session.creatorId,\n            session._id,\n            'CHAT-REF-' + session._id.toString().substring(0, 6),\n            session.totalCost,\n            'chat'\n          );\n        }`;
content = content.replace(targetStr, newStr);

fs.writeFileSync('backend/utils/socketHandlers.js', content);
