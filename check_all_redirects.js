const fs = require('fs');
const path = require('path');

function searchFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      searchFiles(filePath);
    } else if (stat.isFile() && (filePath.endsWith('.js') || filePath.endsWith('.jsx'))) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('redirect=')) {
          console.log(`Found in: ${filePath} at line ${i + 1}: ${lines[i].trim()}`);
        }
      }
    }
  }
}

searchFiles('frontend/src');
