const fs = require('fs');
const path = require('path');
function search(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      search(full);
    } else if (full.endsWith('.jsx') || full.endsWith('.js')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes("navigate(-1)")) {
        console.log(full);
      }
    }
  }
}
search('frontend/src');
