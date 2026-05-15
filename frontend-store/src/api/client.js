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

// Module-level lock to prevent multiple simultaneous refresh requests
let refreshPromise = null;

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

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const msg = String(error.response?.data?.message || '').toLowerCase();
    
    // CSRF Retry
    if (error.response?.status === 403 && msg.includes('csrf') && !original?._csrfRetry) {
      original._csrfRetry = true;
      await api.get('/csrf');
      return api(original);
    }
    
    // Token handling on 401
    if (error.response?.status === 401 && !original?._retry) {
      original._retry = true;
      
      // If the request was for /auth/refresh or /auth/me, don't retry refresh to avoid loops
      if (original.url.includes('/auth/refresh') || original.url.includes('/auth/me')) {
        localStorage.removeItem('auth-storage');
        return Promise.reject(error);
      }

      try {
        if (!refreshPromise) {
          refreshPromise = api.post('/auth/refresh', {}, { withCredentials: true })
            .finally(() => { refreshPromise = null; });
        }
        
        await refreshPromise;
        
        // Fetch fresh CSRF token after auth refresh
        const { data: csrfData } = await api.get('/csrf');
        const freshCsrf = csrfData.token;

        if (freshCsrf) {
          api.defaults.headers.common['X-CSRF-Token'] = freshCsrf;
          original.headers['X-CSRF-Token'] = freshCsrf;
        }

        return api(original); // Retry original request
      } catch (refreshError) {
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
