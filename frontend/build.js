const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building main frontend...');
execSync('npx vite build', { stdio: 'inherit' });

console.log('Building admin frontend...');
const adminDir = path.resolve(__dirname, '../admin-frontend');
execSync('npm install', { cwd: adminDir, stdio: 'inherit' });
execSync('npx vite build', { cwd: adminDir, stdio: 'inherit' });

console.log('Copying admin frontend to dist/admin...');
const adminDist = path.join(adminDir, 'dist');
const destAdmin = path.join(__dirname, 'dist', 'admin');

if (!fs.existsSync(destAdmin)) {
  fs.mkdirSync(destAdmin, { recursive: true });
}

fs.cpSync(adminDist, destAdmin, { recursive: true });
console.log('Combined build complete!');
