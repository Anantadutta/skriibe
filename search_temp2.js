const fs = require('fs');
const path = require('path');

function findStr(dir, str) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      try {
        if (fs.statSync(fullPath).isDirectory()) {
          if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
            findStr(fullPath, str);
          }
        } else {
          if (fullPath.match(/\.(js|jsx|ts|tsx|html|css|json)$/)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.toLowerCase().includes(str.toLowerCase())) {
              console.log(fullPath);
            }
          }
        }
      } catch(e) {}
    });
  } catch(e) {}
}

console.log("Files with recharge:");
findStr('.', 'recharge');
console.log("Files with rs 1:");
findStr('.', 'rs 1');
console.log("Files with wallet:");
findStr('.', 'wallet');
