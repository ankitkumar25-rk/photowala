/**
 * AUTHENTICATION DEBUG GUIDE
 * 
 * This file helps debug why the authentication fixes aren't working.
 * Run these commands in the browser console to diagnose issues.
 */

// === DEBUG 1: Check if tokens exist in localStorage ===
console.log('=== TOKEN STATE ===');
console.log('accessToken:', localStorage.getItem('token') ? 'exists' : 'missing');
console.log('refreshToken:', localStorage.getItem('refreshToken') ? 'exists' : 'missing');
console.log('auth-storage:', localStorage.getItem('auth-storage') ? 'exists' : 'missing');

// === DEBUG 2: Check auth store state ===
console.log('\n=== AUTH STORE STATE ===');
const authState = useAuthStore.getState();
console.log('user:', authState.user);
console.log('isHydrating:', authState.isHydrating);
console.log('isInitialized:', authState.isInitialized);

// === DEBUG 3: Make a test refresh call ===
console.log('\n=== TEST REFRESH ENDPOINT ===');
const testRefresh = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    console.error('❌ No refreshToken in localStorage!');
    return;
  }
  
  try {
    const response = await fetch('https://photowala-5pa7.onrender.com/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`
      },
      credentials: 'include',
      body: JSON.stringify({})
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Refresh successful!');
      console.log('Access token returned:', data.accessToken ? 'yes' : 'no');
      console.log('Refresh token returned:', data.refreshToken ? 'yes' : 'no');
    } else {
      console.error('❌ Refresh failed');
      console.error('Error:', data);
    }
  } catch (err) {
    console.error('❌ Fetch error:', err);
  }
};
await testRefresh();

// === DEBUG 4: Test /auth/me endpoint ===
console.log('\n=== TEST /AUTH/ME ENDPOINT ===');
const testMe = async () => {
  const accessToken = localStorage.getItem('token');
  if (!accessToken) {
    console.error('❌ No accessToken in localStorage!');
    return;
  }
  
  try {
    const response = await fetch('https://photowala-5pa7.onrender.com/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      credentials: 'include'
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ /auth/me successful!');
    } else {
      console.log('❌ /auth/me failed');
    }
  } catch (err) {
    console.error('❌ Fetch error:', err);
  }
};
await testMe();

// === DEBUG 5: Check what the Authorization header is being sent ===
console.log('\n=== NETWORK TAB CHECK ===');
console.log('1. Open DevTools Network tab');
console.log('2. Reload the page');
console.log('3. Find the /api/auth/refresh request');
console.log('4. Look at the "Headers" section');
console.log('5. Check if "Authorization: Bearer <token>" is present');
console.log('6. If not present, the frontend fix might not be deployed');

// === DEBUG 6: Clear auth and try again ===
console.log('\n=== CLEAR AUTH AND TRY AGAIN ===');
const clearAndRetry = async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('auth-storage');
  useAuthStore.setState({ 
    user: null, 
    isHydrating: false, 
    isInitialized: true 
  });
  console.log('✅ Cleared auth. Try logging in again.');
};

// === COMMON ISSUES AND FIXES ===
console.log('\n=== COMMON ISSUES & FIXES ===');
console.log(`
ISSUE 1: "No refreshToken in localStorage"
- CAUSE: User never logged in, or logout was called
- FIX: Go to /login and enter credentials

ISSUE 2: /auth/refresh returns 401 (Unauthorized)
- CAUSE: refreshToken is expired or backend changes not deployed
- FIX 1: Check if backend has the authorization header fix
- FIX 2: Try logging out and back in
- FIX 3: Check backend logs for what token it received

ISSUE 3: Authorization header not sent
- CAUSE: Frontend code might be outdated
- FIX: Clear browser cache and refresh (Ctrl+Shift+Delete)

ISSUE 4: See "Signed in successfully" then immediately "Logged out"
- CAUSE: isHydrating flag not working or /auth/me fails
- FIX: Check if isHydrating becomes false in console
`);
