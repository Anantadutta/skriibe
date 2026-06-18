const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log('Building main frontend...');
  execSync('npm run build:vite', { stdio: 'inherit' });

  console.log('Building admin frontend...');
  const adminDir = path.resolve(__dirname, '../admin-frontend');
  
  if (!fs.existsSync(adminDir)) {
    throw new Error('Admin directory not found at: ' + adminDir);
  }
  
  // Force installing devDependencies in case NODE_ENV=production is set
  execSync('npm install --include=dev', { 
    cwd: adminDir, 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });
  
  execSync('npm run build', { cwd: adminDir, stdio: 'inherit' });

  console.log('Copying admin frontend to dist/admin...');
  const adminDist = path.join(adminDir, 'dist');
  const destAdmin = path.join(__dirname, 'dist', 'admin');

  if (!fs.existsSync(destAdmin)) {
    fs.mkdirSync(destAdmin, { recursive: true });
  }

  // Use cross-platform copy
  fs.cpSync(adminDist, destAdmin, { recursive: true });
  console.log('Combined build complete!');
} catch (error) {
  console.error('Build failed!', error);
  if (error.stdout) console.error(error.stdout.toString());
  if (error.stderr) console.error(error.stderr.toString());
  process.exit(1);
}
