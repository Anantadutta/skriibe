const fs = require('fs');
let content = fs.readFileSync('backend/routes/chat.js', 'utf8');
content = content.replace(/session\.endReason = reason \|\| 'USER_ENDED';\s+const fanName = fan\?\.name \|\| '';/, `session.endReason = reason || 'USER_ENDED';\n\n    if (session.totalCost > 0) {\n      await processAffiliateEarning(\n        session.creatorId,\n        session._id,\n        'CHAT-REF-' + session._id.toString().substring(0, 6),\n        session.totalCost,\n        'chat'\n      );\n    }\n\n    const fanName = fan?.name || '';`);
fs.writeFileSync('backend/routes/chat.js', content);
