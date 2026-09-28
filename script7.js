const fs = require('fs');
const lines = fs.readFileSync('frontend/src/pages/creator/CreatorAuth.jsx', 'utf8').split('\n');
for(let i=30; i<=50; i++) console.log(i + 1 + ': ' + lines[i]);
