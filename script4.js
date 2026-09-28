const fs = require('fs');
const lines = fs.readFileSync('frontend/src/pages/EmailVerificationFlow.jsx', 'utf8').split('\n');
lines.forEach((l, i) => { if (l.includes('navigate')) console.log(i + 1 + ': ' + l.trim()); });
