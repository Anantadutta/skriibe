import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Coalesce identical simultaneous GETs (for example when both fan navs mount at once).
const inFlightGetRequests = new Map();
const axiosGet = api.get.bind(api);
api.get = (url, config = {}) => {
  if (config.signal) return axiosGet(url, config);

  const key = JSON.stringify([
    url,
    config.params || null,
    localStorage.getItem('auth_activeRole'),
    localStorage.getItem('skriibe_admin_token'),
    localStorage.getItem('skriibe_creator_token'),
    localStorage.getItem('skriibe_fan_token'),
    localStorage.getItem('skriibe_token')
  ]);
  const existingRequest = inFlightGetRequests.get(key);
  if (existingRequest) return existingRequest;

  const request = axiosGet(url, config);
  inFlightGetRequests.set(key, request);
  const clearRequest = () => {
    if (inFlightGetRequests.get(key) === request) inFlightGetRequests.delete(key);
  };
  request.then(clearRequest, clearRequest);
  return request;
};

api.interceptors.request.use((config) => {
  const url = new URL(config.url || '', config.baseURL || api.defaults.baseURL).pathname;
  const path = window.location.pathname;

  let token = null;

  // Determine token based on request URL or current page path
  const isCreatorProfilePage = /^\/creator\/(?!dashboard|inbox|analytics|payouts|setup-payouts|settings|scheduling|health|notifications|auth|signup|login|forgot-password|reset-password|verify-otp|connect-instagram)[^\/]+(\/.*)?$/.test(path) ||
    /^\/(?!creator|fan|explore|discovery|admin|api|dashboard|onboard)[^\/]+(\/.*)?$/.test(path);


  // If the request explicitly asks for fan endpoints, or if we are on a fan page, OR if we are on a public creator profile page
  if (url.includes('/fan-auth') || url.includes('/fan') || url.includes('/wallet') || path.startsWith('/fan') || path.startsWith('/explore') || path.startsWith('/discovery') || isCreatorProfilePage) {
    token = localStorage.getItem('skriibe_fan_token');
  } else if (url.includes('/creator') || url.includes('/creators') || path.startsWith('/creator') || path.startsWith('/dashboard') || path.startsWith('/onboard')) {
    token = localStorage.getItem('skriibe_creator_token');
  }

  // Fallback to legacy active token if specific token not found
  if (!token) {
    token = localStorage.getItem('skriibe_token');
  }

  const isAdminRequest = url.startsWith('/admin/') || url.startsWith('/queries/admin');
  const isCreatorRequest = url.startsWith('/creator/') || url.startsWith('/creators/');
  const isFanRequest = url.startsWith('/fan-auth/') || url.startsWith('/wallet/') ||
    url.startsWith('/questions/fan-history') || url.startsWith('/questions/notifications') ||
    url.startsWith('/questions/unread-count') ||
    url.startsWith('/chat/fan-history');
  const activeRole = path.startsWith('/creator') || path.startsWith('/onboard') || path.startsWith('/dashboard')
    ? 'creator'
    : path.startsWith('/fan') || path.startsWith('/explore') || path.startsWith('/discovery')
      ? 'fan'
      : localStorage.getItem('auth_activeRole');
  const role = isAdminRequest ? 'admin' : isCreatorRequest ? 'creator' : isFanRequest ? 'fan' : activeRole;
  const roleTokenKey = role === 'admin' ? 'skriibe_admin_token' : role === 'creator' ? 'skriibe_creator_token' : 'skriibe_fan_token';
  let token = role ? localStorage.getItem(roleTokenKey) : null;
  let tokenKey = token ? roleTokenKey : null;

  // Older sessions only stored the active token. Reuse it only when its claims match
  // the requested role; the server remains responsible for verifying its signature.
  if (!token && role && role !== 'admin') {
    const legacyToken = localStorage.getItem('skriibe_token');
    try {
      const base64 = legacyToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      const payload = JSON.parse(atob(padded));
      const tokenRoles = payload.roles || (payload.role ? [payload.role] : []);
      const matchesRole = role === 'creator'
        ? tokenRoles.includes('creator') || Boolean(payload.creatorId)
        : tokenRoles.includes('fan') || Boolean(payload.fanId);
      if (matchesRole) {
        token = legacyToken;
        tokenKey = 'skriibe_token';
      }
    } catch {
      // Ignore malformed or absent legacy tokens.
    }
  }

  config._authRole = role;
  config._authTokenKey = tokenKey;
  config._authToken = token;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    if (config.headers) delete config.headers.Authorization;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Legacy token auto-save for simple API calls (AuthContext setAuthData handles the specific ones)
    if (response.data && response.data.token && !response.config.url.includes('/login') && !response.config.url.includes('/signup')) {
      localStorage.setItem('skriibe_token', response.data.token);
      window.dispatchEvent(new Event('skriibe:auth'));
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const role = error.config?._authRole;
      const tokenKey = error.config?._authTokenKey;
      const token = error.config?._authToken;

      // Selectively clear the credential actually used for this request.
      if (role === 'admin' && tokenKey === 'skriibe_admin_token') {
        localStorage.removeItem(tokenKey);
      } else if (role === 'creator' && tokenKey) {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem('isReturningCreator');
      } else if (role === 'fan' && tokenKey) {
        localStorage.removeItem(tokenKey);
      }
      if (token && localStorage.getItem('skriibe_token') === token) {
        localStorage.removeItem('skriibe_token');
      }

      if (tokenKey) window.dispatchEvent(new Event('skriibe:auth'));

      // Only redirect if we're not already on a login page to avoid loops
      const path = window.location.pathname;
      const creatorProtectedPaths = [
        '/creator/dashboard', '/creator/inbox', '/creator/analytics', '/creator/payouts',
        '/creator/setup-payouts', '/creator/settings', '/creator/scheduling', '/creator/health',
        '/creator/notifications', '/creator/connect-instagram', '/creator/verify-otp', '/onboard', '/dashboard'
      ];
      const isCreatorProtectedPath = creatorProtectedPaths.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
      const isFanProtectedPath = ['/fan/history', '/fan/notifications', '/fan/profile', '/fan/wallet', '/fan/upgrade']
        .some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
      if (!path.includes('/login') && !path.includes('/signup')) {
        const isCreatorProfilePage = /^\/creator\/(?!dashboard|inbox|analytics|payouts|setup-payouts|settings|scheduling|health|notifications|auth|signup|login|forgot-password|reset-password|verify-otp|connect-instagram)[^\/]+(\/.*)?$/.test(path);

        if (isCreatorProfilePage) {
          // Do not force redirect on public creator profile pages. 
          // The component will handle the 401 gracefully.
        } else if (path.startsWith('/creator') || path.startsWith('/onboard') || path.startsWith('/dashboard')) {
          window.location.href = '/creator/login';
        } else if (isFanProtectedPath) {
          window.location.href = '/fan/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
