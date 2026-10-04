const fs = require('fs');
let content = fs.readFileSync('backend/utils/socketHandlers.js', 'utf8');

const regex2 = /io\.to\(sessionId\.toString\(\)\)\.emit\('chat_transitioned_to_paid', \{ startTime: currentSession\.startTime \}\);/;
const replacement2 = `io.to(sessionId.toString()).emit('chat_transitioned_to_paid', { startTime: currentSession.startTime, rate: currentSession.ratePerMinute });`;

if (regex2.test(content)) {
  content = content.replace(regex2, replacement2);
  fs.writeFileSync('backend/utils/socketHandlers.js', content);
  console.log('Successfully updated emit payload!');
} else {
  console.log('Regex2 did not match!');
}
