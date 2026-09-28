const fs = require('fs');
const path = require('path');
function search(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && file !== 'node_modules' && file !== '.next') {
      search(fullPath);
    } else if (stat.isFile() && ['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(file))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.toLowerCase().includes('whatsapp') || content.toLowerCase().includes('share')) {
        if (content.toLowerCase().includes('creator')) {
          console.log(fullPath);
        }
      }
    }
  }
}
search('./frontend');
