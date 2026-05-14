/**
 * @file otpStore.js
 * @description In-memory OTP storage for creator login/signup.
 */

const otpStore = new Map();

/**
 * Save OTP for a phone number.
 * @param {string} phone 
 * @param {string} otp 
 */
const saveOTP = (phone, otp) => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  otpStore.set(phone, {
    otp,
    expiresAt,
    attempts: 0,
    lockedUntil: null
  });
};

/**
 * Get OTP object for a phone number.
 * @param {string} phone 
 * @returns {Object|null}
 */
const getOTP = (phone) => {
  return otpStore.get(phone) || null;
};

/**
 * Increment attempt count for a phone number.
 * @param {string} phone 
 */
const incrementAttempts = (phone) => {
  const entry = otpStore.get(phone);
  if (entry) {
    entry.attempts += 1;
    otpStore.set(phone, entry);
  }
};

/**
 * Lock a phone number for 30 minutes.
 * @param {string} phone 
 */
const lockPhone = (phone) => {
  const entry = otpStore.get(phone);
  if (entry) {
    entry.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    otpStore.set(phone, entry);
  }
};

/**
 * Clear OTP entry for a phone number.
 * @param {string} phone 
 */
const clearOTP = (phone) => {
  otpStore.delete(phone);
};

module.exports = {
  saveOTP,
  getOTP,
  incrementAttempts,
  lockPhone,
  clearOTP
};
