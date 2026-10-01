/**
 * @file hash-admin-password.js
 * @description Prints the ADMIN_PASSWORD_HASH line for a new admin password.
 * Usage (from the backend folder): node scripts/hash-admin-password.js
 */

const readline = require('readline');
const { hashPassword } = require('../utils/password');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('New admin password (at least 12 characters): ', (password) => {
  rl.close();
  if (!password || password.length < 12) {
    console.error('Password too short. Use at least 12 characters.');
    process.exit(1);
  }
  console.log('\nAdd this line to backend/.env and to your hosting environment:\n');
  console.log(`ADMIN_PASSWORD_HASH=${hashPassword(password)}`);
});
