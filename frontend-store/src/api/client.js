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
      
      // If the request was for /auth/refresh, don't retry refresh to avoid loops
      if (original.url.includes('/auth/refresh')) {
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
        // Do not force redirect here, let the calling code handle it
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh tokens
        const res = await api.post('/auth/refresh');
        const accessToken = res.data?.data?.accessToken;
        const refreshToken = res.data?.data?.refreshToken;
        
        if (accessToken) {
          localStorage.setItem('token', accessToken);
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
          original.headers.Authorization = `Bearer ${accessToken}`;
          return api(original); // Retry original request
        } else {
          throw new Error('No access token in refresh response');
        }
      } catch (refreshError) {
        // Refresh failed (e.g. refresh token expired)
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('auth-storage');
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
