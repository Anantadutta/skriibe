const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  try {
      const list = fs.readdirSync(dir);
      list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
          results = results.concat(walk(file));
        } else {
          if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.tsx') || file.endsWith('.ts')) {
            const content = fs.readFileSync(file, 'utf8');
            if (content.includes('Log in to your fan account') || content.includes('Welcome back')) {
              console.log(file);
            }
          }
        }
      });
  } catch (e) {}
  return results;
}

walk('./frontend/src');
