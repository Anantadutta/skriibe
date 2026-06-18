const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  let entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy pages
copyDir('c:\\Users\\dutta\\Downloads\\skriibe-main\\skriibe-main\\admin-frontend\\src\\pages', 'c:\\Users\\dutta\\Downloads\\skriibe-main\\skriibe-main\\frontend\\src\\pages\\admin_real');

// Copy components
copyDir('c:\\Users\\dutta\\Downloads\\skriibe-main\\skriibe-main\\admin-frontend\\src\\components', 'c:\\Users\\dutta\\Downloads\\skriibe-main\\skriibe-main\\frontend\\src\\components\\admin_real');

console.log("Copy complete!");
