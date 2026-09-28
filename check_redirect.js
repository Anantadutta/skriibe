const fs = require('fs');

const files = [
  'frontend/src/pages/fan/FanWallet.jsx',
  'frontend/src/pages/fan/FanWalletRechargePage.jsx'
];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  content.split('\n').forEach((line, i) => {
    if (line.includes('redirect=')) {
      console.log(`${file}:${i+1}: ${line.trim()}`);
    }
  });
});
