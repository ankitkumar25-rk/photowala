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
  // Attach token from localStorage if present
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

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

    // Handle 401: Clear token and redirect to login
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin-auth'); // Clear any legacy store state
      
      // Prevent redirect loop if already on login or checking self
      if (window.location.pathname !== '/login' && original.url !== '/auth/me') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(err);
  }
);

export default api;
