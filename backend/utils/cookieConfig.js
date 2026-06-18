const getCookieOptions = (additionalOptions = {}) => {
  // Always use SameSite=None and Secure=true to guarantee cross-site functionality
  // on platforms like Vercel and Render. Localhost correctly supports Secure cookies
  // in modern browsers, so this is safe for local development as well.
  return {
    httpOnly: true,
    secure: true, 
    sameSite: 'none',
    path: '/',
    ...additionalOptions
  };
};

const getClearCookieOptions = () => ({
  path: '/',
  secure: true,
  sameSite: 'none'
});

module.exports = {
  getCookieOptions,
  getClearCookieOptions
};
