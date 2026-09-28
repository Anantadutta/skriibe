const fs = require('fs');
const path = require('path');

function findStr(dir) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      try {
        if (fs.statSync(fullPath).isDirectory()) {
          if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
            findStr(fullPath);
          }
        } else {
          if (fullPath.match(/\.(js|jsx|ts|tsx)$/)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('presets =')) {
              console.log(fullPath);
            }
          }
        }
      } catch(e) {}
    });
  } catch(e) {}
}

findStr('frontend/src');
