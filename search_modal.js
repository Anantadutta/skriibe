const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f === 'node_modules' || f === '.next') continue;
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.match(/\.(tsx?|jsx?)$/)) {
      const c = fs.readFileSync(p, 'utf8');
      if (c.includes('Back to chat interface') || c.includes('Yes, I want to end') || c.includes('Leave and End Chat?')) {
        console.log(p);
      }
    }
  }
}

walk('frontend');
walk('admin-frontend');
