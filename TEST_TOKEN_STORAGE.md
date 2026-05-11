# Token Storage Bug - Verification Tests

## Status Check
- **Issue:** After login/Google OAuth, refreshToken not saved to localStorage
- **Expected:** Both 'token' and 'refreshToken' keys in localStorage after authentication
- **Fixes Applied:** Enhanced logging in login/register/AuthSuccess pages

---

## Manual Test Steps

### Test A: Direct Backend API Check
**Purpose:** Verify backend returns refreshToken in response

```bash
# Start backend (if not running)
cd backend && npm start

# In another terminal, test login endpoint
curl -X POST http://localhost:10000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@photowala.com",
    "password": "YourSecurePassword123!"
  }' | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "...",
      "email": "admin@photowala.com",
      "role": "admin"
    },
    "accessToken": "v2.public.xxx...",
    "refreshToken": "v2.public.yyy..."
  }
}
```

**What to check:**
- ✅ `data.accessToken` exists and is non-empty
- ✅ `data.refreshToken` exists and is non-empty
- ❌ If `refreshToken` is missing/null → Backend bug, not frontend

---

### Test B: Frontend Login Flow (Chrome/Firefox)
**Purpose:** Verify frontend saves tokens to localStorage

1. **Clear previous state:**
   - Open http://localhost:5173 in browser
   - DevTools → Application → LocalStorage → Clear all
   - Close DevTools console to avoid logs interfering

2. **Open DevTools and Login:**
   - Press F12 to open DevTools
   - Go to Application tab → LocalStorage → http://localhost:5173
   - Note initial state (should be empty)
   - Go to Console tab, paste this to monitor localStorage:
     ```javascript
     setInterval(() => {
       const token = localStorage.getItem('token');
       const refreshToken = localStorage.getItem('refreshToken');
       console.log(`[Monitor] token: ${token ? 'YES (' + token.substring(0,10) + '...)' : 'NO'}, refreshToken: ${refreshToken ? 'YES (' + refreshToken.substring(0,10) + '...)' : 'NO'}`);
     }, 1000);
     ```

3. **Trigger Login:**
   - Go to /login page
   - Enter credentials: admin@photowala.com / password
   - Click "Sign In"

4. **Monitor Console for Logs:**
   - Should see: `[Auth] Login response structure:` with full response
   - Should see: `[Auth] Tokens saved to localStorage:` with { token: true, refreshToken: true }
   - Should see: `[Monitor]` showing token and refreshToken present

5. **Check LocalStorage Tab:**
   - Go to Application tab
   - Click on LocalStorage → http://localhost:5173
   - Should see keys: 'token', 'refreshToken', 'auth-storage'
   - 'token' value should be 50+ characters (PASETO token)
   - 'refreshToken' value should be 50+ characters

6. **Reload and Verify:**
   - Press F5 to reload page
   - Should remain logged in (no redirect to /login)
   - Navbar should show user name, not login button

---

### Test C: Google OAuth Flow (Brave/Safari)
**Purpose:** Verify tokens extracted from OAuth redirect URL

1. **Setup:**
   - Clear LocalStorage again
   - Open DevTools Console

2. **Click "Sign in with Google":**
   - Will redirect to Google login
   - After signing in, will redirect to http://localhost:5173/auth/success?access_token=...&refresh_token=...

3. **Check AuthSuccess Page Logs:**
   - Should see console logs:
     ```
     [Auth] AuthSuccess callback - URL params: {accessToken: true, refreshToken: true}
     [Auth] Access token saved to localStorage
     [Auth] Refresh token saved to localStorage
     [Auth] fetchMe successful, redirecting to home
     ```

4. **Verify LocalStorage:**
   - After redirect completes, check LocalStorage
   - Should have 'token' and 'refreshToken' keys

---

## Debugging: If Tokens NOT Showing

### Check 1: Response Shape
```javascript
// In browser console during login
// Clear console first, then login and immediately check:
console.log('localStorage.token:', localStorage.getItem('token'));
console.log('localStorage.refreshToken:', localStorage.getItem('refreshToken'));
```

### Check 2: Response Extraction
```javascript
// Paste into console to see what login() receives:
const origLogin = useAuthStore.getState().login;
useAuthStore.getState().login = async (creds) => {
  const resp = await origLogin(creds);
  console.log('FULL LOGIN RESPONSE:', resp);
  return resp;
};
// Then try login again
```

### Check 3: OAuth URL Params
When at /auth/success page, paste in console:
```javascript
const params = new URLSearchParams(window.location.search);
console.log('URL access_token:', params.get('access_token'));
console.log('URL refresh_token:', params.get('refresh_token'));
console.log('LocalStorage after:', {
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken')
});
```

---

## Expected Outcomes

### ✅ SUCCESS - Tokens Saved
- localStorage has 'token' with value like: `v2.public.xxx...`
- localStorage has 'refreshToken' with value like: `v2.public.yyy...`
- Page reload stays logged in
- No 401 errors on subsequent API calls

### ❌ FAILURE - Tokens Missing
- localStorage empty after login
- Page reload shows login page
- Network shows 401 responses
- Error logs may show:
  - Backend not returning refreshToken
  - Frontend not extracting/saving tokens
  - Browser privacy blocking localStorage access

---

## If Tests Still Fail

### Collect Debug Info:
1. Run curl test (Test A) - send output
2. Browser console during login - take screenshot
3. LocalStorage state after login - take screenshot
4. Network tab showing login request/response - take screenshot
5. Search for error message in console

### Possible Issues:
- Backend not including refreshToken in response
- localStorage disabled in browser (Privacy setting)
- Response path changed in backend (data.refreshToken vs data.data.refreshToken)
- Error thrown before localStorage.setItem is called
