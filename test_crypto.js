const crypto = require('crypto');

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password, storedHash) => {
  if (!storedHash || !storedHash.includes(':')) return false;
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const hashedBuffer = crypto.scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(key, 'hex');
    return crypto.timingSafeEqual(hashedBuffer, keyBuffer);
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
};

const pwd = 'password123';
const hash = hashPassword(pwd);
console.log('hash:', hash);
console.log('verify:', verifyPassword(pwd, hash));
console.log('verify wrong:', verifyPassword('wrong', hash));
