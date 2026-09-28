const fs = require('fs');
const path = require('path');
function search(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const p = path.join(dir, f);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      if (!p.includes('node_modules') && !p.includes('.git') && !p.includes('.next')) {
        search(p);
      }
    } else {
      if (p.endsWith('.js') || p.endsWith('.jsx') || p.endsWith('.tsx') || p.endsWith('.ts')) {
        const content = fs.readFileSync(p, 'utf-8');
        if (content.includes('duration') && (content.includes('Inbox') || content.includes('inbox'))) {
          console.log(p);
        }
      }
    }
  }
}
search('.');
