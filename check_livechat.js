const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/fan/LiveChatInterface.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => { if(l.toLowerCase().includes('arrowleft') || l.toLowerCase().includes('back') || l.includes('navigate(')) console.log(i+1, l); });
