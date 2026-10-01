const fs = require('fs');
const path = require('path');

function search(dir, pattern) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        search(fullPath, pattern);
      }
    } else {
      if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.toLowerCase().includes(pattern.toLowerCase())) {
          console.log(`Found in: ${fullPath}`);
          const lines = content.split('\n');
          lines.forEach((line, i) => {
            if (line.toLowerCase().includes(pattern.toLowerCase())) {
              console.log(`${i + 1}: ${line.trim()}`);
            }
          });
        }
      }
    }
  }
}

search('c:\\Users\\dutta\\Downloads\\skriibe-main\\skriibe-main', 'join as a creator');
