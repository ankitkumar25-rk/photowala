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

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const msg = String(error.response?.data?.message || '').toLowerCase();
    if (error.response?.status === 403 && msg.includes('csrf') && !original?._csrfRetry) {
      original._csrfRetry = true;
      await api.get('/csrf');
      return api(original);
    }
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
        await axios.post(`${baseURL}/auth/refresh`, {}, {
          withCredentials: true,
          headers: { 'X-CSRF-Token': readCookie('csrf_token') || '' },
        });
        return api(original);
      } catch {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
