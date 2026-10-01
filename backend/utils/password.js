/**
 * @file password.js
 * @description Password hashing helpers (scrypt) shared by fan, creator and admin auth.
 */

const crypto = require('crypto');

// Stored format is "<32 hex salt>:<128 hex scrypt key>"
const HASH_FORMAT = /^[0-9a-f]{32}:[0-9a-f]{128}$/;

// Written by OAuth signup and ban stubs instead of a real password; must never work as a login
const PLACEHOLDER_PASSWORDS = ['oauth_dummy_pass', 'banned_stub_account'];

// Helper function to hash password
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

// Helper function to verify password
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

// True when the stored value is one of our hashes rather than a legacy plain-text password
const isPasswordHash = (value) => typeof value === 'string' && HASH_FORMAT.test(value);

const isPlaceholderPassword = (value) => PLACEHOLDER_PASSWORDS.includes(value);

// Constant-time string comparison
const safeEqual = (a, b) => {
  const aDigest = crypto.createHash('sha256').update(String(a)).digest();
  const bDigest = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(aDigest, bDigest);
};

module.exports = { hashPassword, verifyPassword, isPasswordHash, isPlaceholderPassword, safeEqual };
