const fs = require('fs');
const path = require('path');

function search(dir, pattern, outputFile) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        search(fullPath, pattern, outputFile);
      }
    } else {
      if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.toLowerCase().includes(pattern.toLowerCase())) {
          fs.appendFileSync(outputFile, `Found in: ${fullPath}\n`);
          const lines = content.split('\n');
          lines.forEach((line, i) => {
            if (line.toLowerCase().includes(pattern.toLowerCase())) {
              fs.appendFileSync(outputFile, `${i + 1}: ${line.trim()}\n`);
            }
          });
        }
      }
    }
  }
}

fs.writeFileSync('c:\\Users\\dutta\\Downloads\\skriibe-main\\skriibe-main\\search_results.txt', '');
search('c:\\Users\\dutta\\Downloads\\skriibe-main\\skriibe-main\\frontend', 'join as a creator', 'c:\\Users\\dutta\\Downloads\\skriibe-main\\skriibe-main\\search_results.txt');
