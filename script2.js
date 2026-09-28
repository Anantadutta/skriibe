const fs = require('fs');
const lines = fs.readFileSync('frontend/src/pages/CreatorDashboard.jsx', 'utf8').split('\n');
lines.forEach((l, i) => { if (l.includes('/creator/login')) console.log(i + 1 + ': ' + l.trim()); });
