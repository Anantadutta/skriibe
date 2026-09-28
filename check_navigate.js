const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/fan/FanHistory.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => { if(l.includes('navigate(')) console.log(i+1, l); });
