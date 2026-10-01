/**
 * @file validateEnv.js
 * @description Startup check for the secrets the server cannot run safely without.
 */

const REQUIRED_SECRETS = ['JWT_SECRET', 'SESSION_SECRET', 'ENCRYPTION_KEY'];

// The old hardcoded fallbacks. Anyone who has seen the source code knows these values.
const KNOWN_DEFAULTS = ['secret', 'your_jwt_secret', 'skriibe_session_secret', '12345678901234567890123456789012'];

const validateEnv = () => {
  const missing = REQUIRED_SECRETS.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}. Set them in backend/.env (see .env.example) or in your hosting dashboard.`;
    console.error(`FATAL: ${message}`);
    throw new Error(message);
  }

  const weak = REQUIRED_SECRETS.filter((name) => KNOWN_DEFAULTS.includes(process.env[name]));
  if (weak.length > 0) {
    console.warn(`SECURITY WARNING: ${weak.join(', ')} still use a publicly known default value. Replace them with long random values before going live.`);
  }

  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD_HASH) {
    console.warn('Admin login is disabled until ADMIN_USERNAME and ADMIN_PASSWORD_HASH are set (see scripts/hash-admin-password.js).');
  }
  if (!process.env.CRON_SECRET) {
    console.warn('Cron trigger endpoints (/api/cron/*) are disabled until CRON_SECRET is set.');
  }
};

module.exports = validateEnv;
