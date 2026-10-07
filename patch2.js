const fs = require('fs');
let content = fs.readFileSync('backend/utils/socketHandlers.js', 'utf8');
content = content.replace(
  /socket\.on\('wallet_recharged', \(\{ sessionId \}\) => \{([\s\S]*?)io\.to\(sessionId\.toString\(\)\)\.emit\('wallet_recharged'\);\s*\}\);/,
  `socket.on('wallet_recharged', ({ sessionId, newBalance }) => {$1io.to(sessionId.toString()).emit('wallet_recharged');\n      if (newBalance !== undefined) {\n        io.to(sessionId.toString()).emit('wallet_update', { balance: newBalance });\n      }\n    });`
);
fs.writeFileSync('backend/utils/socketHandlers.js', content);
