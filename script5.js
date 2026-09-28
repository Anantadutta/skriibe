const fs = require('fs');
const lines = fs.readFileSync('backend/routes/creators.js', 'utf8').split('\n');
for(let i=400; i<=425; i++) console.log(i + 1 + ': ' + lines[i]);
