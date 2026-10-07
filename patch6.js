const fs = require('fs');
let content = fs.readFileSync('backend/utils/socketHandlers.js', 'utf8');

const regex = /currentSession\.isFreeChat = false;\s*currentSession\.startTime = new Date\(\);/;
const replacement = `currentSession.isFreeChat = false;
          currentSession.startTime = new Date();
          const CreatorModel = require('../models/Creator');
          const creatorData = await CreatorModel.findById(currentSession.creatorId);
          if (creatorData) currentSession.ratePerMinute = creatorData.liveChatPrice || 5;`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('backend/utils/socketHandlers.js', content);
  console.log('Successfully updated ratePerMinute transition!');
} else {
  console.log('Regex did not match!');
}
