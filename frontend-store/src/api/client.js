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
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('auth-storage');
        console.warn('[Auth] Refresh token expired or invalid, logging out');
        // Do not force redirect here, let the calling code handle it
        return Promise.reject(error);
      }

      try {
        // Use a module-level lock to prevent multiple simultaneous refresh requests
        // If a refresh is already in flight, wait for it instead of starting a new one
        if (!refreshPromise) {
          const refreshToken = localStorage.getItem('refreshToken');
          console.log('[Auth] Attempting refresh with token:', refreshToken ? 'present' : 'missing');
          
          if (!refreshToken) {
            console.warn('[Auth] No refresh token in localStorage, cannot refresh');
            throw new Error('No refresh token available');
          }
          
          refreshPromise = api.post('/auth/refresh', {}, {
            headers: { Authorization: `Bearer ${refreshToken}` },
            withCredentials: true
          })
            .then(res => {
              console.log('[Auth] Refresh successful, response:', res.data);
              return res;
            })
            .catch(err => {
              console.error('[Auth] Refresh failed:', err.response?.data || err.message);
              throw err;
            })
            .finally(() => { refreshPromise = null; });
        }
        
        const res = await refreshPromise;
        const accessToken = res.data?.accessToken || res.data?.data?.accessToken;
        const newRefreshToken = res.data?.refreshToken || res.data?.data?.refreshToken;
        
        console.log('[Auth] Extracted tokens - access:', !!accessToken, 'refresh:', !!newRefreshToken);
        
        if (accessToken) {
          localStorage.setItem('token', accessToken);
          if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
          original.headers.Authorization = `Bearer ${accessToken}`;
          console.log('[Auth] Retry original request with new token');
          return api(original); // Retry original request
        } else {
          throw new Error('No access token in refresh response');
        }
      } catch (refreshError) {
        // Refresh failed (e.g. refresh token expired)
        console.error('[Auth] Refresh failed, clearing auth:', refreshError.message);
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
