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
let csrfTokenBuffer = null;

async function refreshCsrf() {
  const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
  const res = await axios.get(`${baseURL}/csrf`, { withCredentials: true });
  // Prioritize body, fallback to cookie
  const token = res.data?.token || res.data?.csrfToken || readCookie('csrf_token');
  if (token) {
    csrfTokenBuffer = token;
  }
  return token;
}

async function ensureCsrfCookie() {
  const cookie = readCookie('csrf_token');
  if (cookie) {
    csrfTokenBuffer = cookie;
    return cookie;
  }
  if (csrfTokenBuffer) return csrfTokenBuffer;
  
  if (!csrfBootstrapPromise) {
    csrfBootstrapPromise = refreshCsrf()
      .finally(() => { csrfBootstrapPromise = null; });
  }
  return csrfBootstrapPromise;
}

api.interceptors.request.use((config) => {
  const method = String(config.method || 'get').toUpperCase();
  const unsafe = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  
  if (unsafe && !readCookie('csrf_token') && !csrfTokenBuffer) {
    return ensureCsrfCookie().then((token) => {
      if (token) {
        config.headers = config.headers || {};
        config.headers['X-CSRF-Token'] = token;
      }
      return config;
    });
  }
  
  const token = readCookie('csrf_token') || csrfTokenBuffer;
  if (token) {
    config.headers = config.headers || {};
    config.headers['X-CSRF-Token'] = token;
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
      await refreshCsrf();
      return api(original);
    }

    // Handle 401: Attempt refresh or redirect
    if (err.response?.status === 401 && !original?._retry) {
      original._retry = true;

      // Skip refresh for auth-related calls to avoid loops
      if (original.url.includes('/auth/me') || original.url.includes('/auth/refresh')) {
        localStorage.removeItem('admin-auth');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(err);
      }

      try {
        await refreshPromise;
        
        // Refresh CSRF as well
        const freshCsrf = await refreshCsrf();
        
        return api(original);
      } catch (refreshErr) {
        localStorage.removeItem('admin-auth');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      }
    }
    
    return Promise.reject(err);
  }
);

export default api;
