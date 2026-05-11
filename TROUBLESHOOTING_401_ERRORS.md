# 🔴 PRODUCTION ERROR: Auth Endpoints Returning 401

## Problem Summary

Based on the error logs you provided, both endpoints are returning 401:
- `GET /api/auth/me` → 401
- `POST /api/auth/refresh` → 401

This indicates **the backend changes have NOT been deployed yet**, or there's a deeper issue.

---

## Root Cause Analysis

### Most Likely: Backend Not Redeployed

The 401 on `/api/auth/refresh` indicates the backend is still using the OLD code that:
- ✅ Reads from cookies 
- ❌ Does NOT read from Authorization header

**How to verify:**
1. SSH into your Render backend
2. Check: `grep -n "authHeader" backend/src/controllers/auth.controller.js`
3. If NOT found → backend wasn't deployed

### Second Most Likely: refreshToken Expired

If backend WAS deployed correctly, the 401 could mean:
- The refreshToken in localStorage is expired
- The token doesn't exist in the database
- The token signature is invalid

---

## CRITICAL DEPLOYMENT STEPS

### Step 1: Verify Backend Code Has Changes

```bash
# In your GitHub repo, check if these files are committed:
git log --oneline backend/src/controllers/auth.controller.js | head -5

# Look for a recent commit mentioning "Authorization header" or similar
```

**Expected output:**
```
abc1234 Fix: Accept refresh token from Authorization header
```

**If NOT found:**
- The fix wasn't pushed to GitHub
- You need to commit and push the changes from your local machine

### Step 2: Deploy Backend

```bash
# Push backend changes to trigger deployment
git push origin main

# Go to https://dashboard.render.com
# - Select your backend service  
# - Check "Latest Deploy" status
# - Wait for it to show "Live" (usually 2-3 minutes)
```

### Step 3: Verify Backend Deployment

**In browser console, run:**
```javascript
const refreshToken = localStorage.getItem('refreshToken');

// If you have a refreshToken, test it:
if (refreshToken) {
  fetch('https://photowala-5pa7.onrender.com/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${refreshToken}`
    },
    credentials: 'include',
    body: JSON.stringify({})
  })
  .then(r => {
    console.log('Status:', r.status);
    return r.json();
  })
  .then(d => console.log('Response:', d));
}
```

**Expected responses after fix:**

✅ **Success (status 200):**
```json
{
  "success": true,
  "user": { "id": "...", "name": "...", "email": "...", "role": "..." },
  "accessToken": "v2.public.eyJ...",
  "refreshToken": "v2.public.eyJ..."
}
```

❌ **Still broken (status 401):**
```json
{
  "success": false,
  "error": "Refresh token required",
  "message": "Authentication failed"
}
```
- **Means:** Backend changes NOT deployed, Authorization header still not being read

✅ **Token expired (status 401, but from backend fix):**
```json
{
  "success": false,
  "error": "REFRESH_TOKEN_EXPIRED",
  "message": "Session expired"
}
```
- **Means:** Backend IS deployed correctly, just your token is old
- **Fix:** Clear localStorage and login again

### Step 4: Deploy Frontend

```bash
# Push frontend changes
git push origin main

# Go to https://vercel.com
# - Select project
# - Should show new deployment starting
# - Wait 5-10 minutes for build complete
```

### Step 5: Clear Browser Cache

```bash
# Full cache clear:
Ctrl + Shift + Delete (or Cmd + Shift + Delete on Mac)

# Then hard reload:
Ctrl + F5 (or Cmd + Shift + R on Mac)
```

### Step 6: Test in Browser

**Expected behavior after fixes:**

1. ✅ Visit app homepage → should check auth in background
2. ✅ If logged in → show user menu briefly, then stable
3. ✅ If not logged in → show login button immediately
4. ✅ NO 401 errors in console
5. ✅ Network tab shows `/api/auth/refresh` with `Authorization: Bearer` header
6. ✅ Open in Brave with Shields up → should still work

---

## Emergency Fallback: Clear Auth and Re-Login

If you're still stuck, force a clean login:

**In browser console:**
```javascript
// Completely clear authentication
localStorage.removeItem('token');
localStorage.removeItem('refreshToken');
localStorage.removeItem('auth-storage');

// Reset auth store
useAuthStore.setState({
  user: null,
  isInitialized: true,
  isHydrating: false
});

// Redirect to login
window.location.href = '/login';
```

Then:
1. Go to `/login`
2. Enter your credentials
3. You should see "Signed in successfully" toast
4. Should redirect to home page
5. User menu should appear in navbar

---

## Quick Diagnostic Script

**Copy-paste this into browser console to run full diagnostic:**

```javascript
console.clear();
console.log('=== PHOTOWALA AUTH DIAGNOSTIC ===\n');

// 1. Token state
const token = localStorage.getItem('token');
const refreshToken = localStorage.getItem('refreshToken');
console.log('📦 Tokens in localStorage:');
console.log('  - Access Token:', token ? '✅ exists' : '❌ missing');
console.log('  - Refresh Token:', refreshToken ? '✅ exists' : '❌ missing');

// 2. Auth store
const authState = useAuthStore.getState();
console.log('\n👤 Auth Store:');
console.log('  - User:', authState.user ? `✅ ${authState.user.name}` : '❌ null');
console.log('  - isHydrating:', authState.isHydrating);
console.log('  - isInitialized:', authState.isInitialized);

// 3. Test refresh endpoint
console.log('\n🔄 Testing /auth/refresh endpoint...');
if (!refreshToken) {
  console.error('  ❌ No refreshToken in localStorage - cannot test');
} else {
  fetch('https://photowala-5pa7.onrender.com/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${refreshToken}`
    },
    credentials: 'include',
    body: '{}'
  })
  .then(r => r.json())
  .then(d => {
    if (d.success) {
      console.log('  ✅ Refresh successful!');
      console.log('    New tokens returned:', d.accessToken ? 'yes' : 'no');
    } else {
      console.log('  ❌ Refresh failed:', d.error || d.message);
    }
  })
  .catch(e => console.error('  ❌ Network error:', e.message));
}

// 4. Check network requests
console.log('\n📡 Network Monitoring:');
console.log('  ℹ️  Open DevTools → Network tab');
console.log('  ℹ️  Look for /api/auth/refresh request');
console.log('  ℹ️  Check "Headers" section for:');
console.log('       Authorization: Bearer <token>');
console.log('\n✅ Diagnostic complete. Check results above.');
```

---

## Files to Verify Are Deployed

### Backend ✅
- [ ] `backend/src/controllers/auth.controller.js` (lines 143-158) - Authorization header check
- [ ] Render shows "Live" status for the deployment

### Frontend ✅
- [ ] `frontend-store/src/api/client.js` (lines 16, 88-105) - Send Authorization header
- [ ] `frontend-store/src/store/index.js` - isHydrating flag
- [ ] `frontend-store/src/components/Navbar.jsx` - isHydrating guard
- [ ] Vercel shows build succeeded

---

## Support Commands

**Get backend logs:**
```bash
# In Render dashboard, select backend service
# Click "Logs" tab
# Search for "[Auth]" or "authorization"
# Look for errors
```

**Get frontend logs:**
```bash
# In Vercel dashboard, select project
# Click "Logs" tab
# Search for "401" or "refresh"
```

---

**What to do next:**
1. ✅ Verify changes are committed and pushed to GitHub
2. ✅ Manually trigger backend deployment on Render
3. ✅ Wait 5 minutes and test with diagnostic script  
4. ✅ Deploy frontend if backend is working
5. ✅ Clear cache and reload
6. ✅ Test login flow in all browsers

**Questions?** Check the full docs:
- [AUTHENTICATION_BUG_FIX.md](AUTHENTICATION_BUG_FIX.md) - Complete technical details
- [DEPLOYMENT_VERIFICATION.md](DEPLOYMENT_VERIFICATION.md) - Deployment checklist
- [DEBUG_AUTH.js](DEBUG_AUTH.js) - Browser console debugging script
