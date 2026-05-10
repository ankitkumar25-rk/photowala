import axios from 'axios';

function readCookie(name) {
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : '';
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let csrfBootstrapPromise = null;
async function ensureCsrfCookie() {
  if (readCookie('csrf_token')) return;
  if (!csrfBootstrapPromise) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
    csrfBootstrapPromise = axios.get(`${baseURL}/csrf`, { withCredentials: true })
      .finally(() => { csrfBootstrapPromise = null; });
  }
  await csrfBootstrapPromise;
}

api.interceptors.request.use((config) => {
  const method = String(config.method || 'get').toUpperCase();
  const unsafe = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  if (unsafe && !readCookie('csrf_token')) {
    return ensureCsrfCookie().then(() => {
      const csrfToken = readCookie('csrf_token');
      if (csrfToken) {
        config.headers = config.headers || {};
        config.headers['X-CSRF-Token'] = csrfToken;
      }
      return config;
    });
  }
  const csrfToken = readCookie('csrf_token');
  if (csrfToken) {
    config.headers = config.headers || {};
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const msg = String(err.response?.data?.message || '').toLowerCase();
    
    // Handle CSRF retry
    if (err.response?.status === 403 && msg.includes('csrf') && !original?._csrfRetry) {
      original._csrfRetry = true;
      await api.get('/csrf');
      return api(original);
    }

    // Auto-refresh on 401
    // Only attempt token refresh if this is not a GET request to /auth/me
    if (err.response?.status === 401 && !original._retry && original.url !== '/auth/me') {
      original._retry = true;
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
        await axios.post(`${baseURL}/auth/refresh`, {}, {
          withCredentials: true,
          headers: { 'X-CSRF-Token': readCookie('csrf_token') || '' },
        });
        return api(original);
      } catch (refreshErr) {
        // Refresh failed → logout
        console.error('[Admin Auth] Refresh failed, logging out', refreshErr);
        sessionStorage.removeItem('admin-auth');
        window.location.href = '/login';
      }
    }

    // Handle standard 401 for /auth/me or other failures
    if (err.response?.status === 401) {
      sessionStorage.removeItem('admin-auth');
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login' && original.url !== '/auth/me') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(err);
  }
);

export default api;
