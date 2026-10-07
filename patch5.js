const fs = require('fs');
let content = fs.readFileSync('backend/utils/socketHandlers.js', 'utf8');

const regex = /socket\.on\('wallet_recharged', \(\{ sessionId, newBalance \}\) => \{([\s\S]*?)\n      if \(newBalance !== undefined\) \{\n        io\.to\(sessionId\.toString\(\)\)\.emit\('wallet_update', \{ balance: newBalance \}\);\n      \}\n    \}\);/;

const replacement = `socket.on('wallet_recharged', async ({ sessionId, newBalance }) => {$1
      const currentSession = await ChatSession.findById(sessionId);
      if (currentSession) {
        const fan = await Fan.findById(currentSession.fanId);
        if (fan) {
          io.to(sessionId.toString()).emit('wallet_update', { balance: fan.walletBalance });
        }
      }
    });`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('backend/utils/socketHandlers.js', content);
  console.log('Successfully patched socketHandlers.js for wallet_recharged!');
} else {
  console.log('Regex did not match anything!');
}
