const isProd = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true' || (process.env.FRONTEND_URL && !process.env.FRONTEND_URL.includes('localhost'));

const getCookieOptions = (additionalOptions = {}) => ({
  httpOnly: true,
  secure: isProd ? true : false,
  sameSite: isProd ? 'none' : 'lax',
  path: '/',
  ...additionalOptions
});

const getClearCookieOptions = () => ({
  path: '/',
  secure: isProd ? true : false,
  sameSite: isProd ? 'none' : 'lax'
});

module.exports = {
  isProd,
  getCookieOptions,
  getClearCookieOptions
};
