# 🚀 Deployment Verification Checklist

## Backend Deployment Status

### Critical: Verify Backend Changes Are Deployed

The following files **MUST** be deployed to production for the fixes to work:

#### 1. `/backend/src/controllers/auth.controller.js` - Lines 143-158
   
**Check:** Look for the Authorization header extraction code:
```javascript
const authHeader = req.headers?.authorization;
let token = req.cookies?.refresh_token;
if (!token && authHeader && authHeader.startsWith('Bearer ')) {
  token = authHeader.split(' ')[1];
}
if (!token) {
  token = req.body?.refreshToken;
}
if (!token) throw createError('Refresh token required', 401);
```

**Verification in Production:**
- SSH into backend server or check deployment logs
- Search for "Authorization header" in the code  
- Or make a test request: `POST /api/auth/refresh` with `Authorization: Bearer <token>` header (no body)
- Should return 200 if token is valid, not 401

---

### Frontend Deployment Status

#### 1. `/frontend-store/src/api/client.js` - Lines 16 & 70-120

**Check:** Look for module-level `refreshPromise` variable and Authorization header being sent:
```javascript
let refreshPromise = null;  // Should be at top level

// In interceptor:
const refreshToken = localStorage.getItem('refreshToken');
refreshPromise = api.post('/auth/refresh', {}, {
  headers: { Authorization: `Bearer ${refreshToken}` },  // Should send header
  withCredentials: true
});
```

**Verification:**
- Open DevTools → Network tab
- Reload page while logged in (or trigger 401 error)
- Look for `/api/auth/refresh` request
- Check "Headers" section
- Should see `Authorization: Bearer <token>`

#### 2. `/frontend-store/src/store/index.js` - Multiple locations

**Check:** Look for `isHydrating` flag:
```javascript
isHydrating: true,  // Should be in initial state

fetchMe: async () => {
  // ...
  set({ ..., isHydrating: false });  // Should be set to false when done
}
```

#### 3. `/frontend-store/src/components/Navbar.jsx` - Lines 19-21, 182-213, 257-277

**Check:** Look for isHydrating guard:
```javascript
const isHydrating = useAuthStore((s) => s.isHydrating);

{isHydrating ? (
  <div className="w-8 h-8 bg-brand-primary/10 rounded-full" />  // Placeholder
) : user ? (
  // Show user menu
) : (
  // Show login button
)}
```

---

## Deployment Order

**Do NOT deploy frontend before backend** - otherwise:
- Frontend sends Authorization header
- Backend doesn't read it
- 401 returned
- Users can't login

### Correct Deployment Sequence:

1. ✅ **Deploy Backend FIRST**
   - Merge PR to backend
   - Wait for backend to restart on Render
   - Verify endpoint responds correctly

2. ⏳ **Verify Backend Works** (5-10 minutes after deploy)
   ```bash
   curl -X POST https://photowala-5pa7.onrender.com/api/auth/refresh \
     -H "Authorization: Bearer YOUR_REFRESH_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{}'
   ```
   Should return: `{ "success": true, "accessToken": "...", "refreshToken": "..." }`

3. ✅ **Deploy Frontend**
   - Merge PR to frontend-store  
   - Wait for frontend to rebuild on Vercel

4. ✅ **Verify Frontend Works** (5-10 minutes after deploy)
   - Clear browser cache (Ctrl+Shift+Delete)
   - Open DevTools Console and run debug script (see DEBUG_AUTH.js)
   - Try logging in and verify no "signed in → logged out" flash

---

## Current Deployment Status

### ❓ Is Backend Deployed?

**How to Check:**
1. Go to https://photowala-5pa7.onrender.com/api/health
2. Should return OK status
3. But this doesn't verify if the auth changes are deployed

**Better Check - Run Test:**
```javascript
// In browser console:
const refreshToken = localStorage.getItem('refreshToken');
if (refreshToken) {
  fetch('https://photowala-5pa7.onrender.com/api/auth/refresh', {
    method: 'POST',
    headers: { Authorization: `Bearer ${refreshToken}` },
    credentials: 'include',
    body: JSON.stringify({})
  }).then(r => r.json()).then(d => console.log('Result:', d));
}
```

If you see: `{ "success": false, "error": "REFRESH_TOKEN_EXPIRED" }` → ✅ Backend is deployed (old token just expired)
If you see: `{ "success": false, "error": "Refresh token required" }` → ❌ Backend NOT deployed (header not being read)

---

## Verification Checklist

### Backend Verification (After Deployment)

- [ ] Backend server is running (health check returns OK)
- [ ] `/api/auth/refresh` accepts Authorization header
- [ ] With valid refreshToken in header: returns 200 + new tokens
- [ ] With invalid refreshToken in header: returns 401 with proper message
- [ ] With no refreshToken in header but in body: still works (backward compat)
- [ ] With no refreshToken anywhere: returns 401

### Frontend Verification (After Deployment)

- [ ] Frontend loads without errors
- [ ] DevTools console shows no 500/503 errors
- [ ] Network tab shows `/api/auth/refresh` with Authorization header
- [ ] Navbar shows placeholder briefly while checking auth
- [ ] No flash from "logged in" to "logged out" state
- [ ] Login/Register works
- [ ] Can click logout and see "Logged out" message
- [ ] Opening new tab while logged in → user is still logged in
- [ ] Token refresh happens silently without user seeing it

### Cross-Browser Testing

- [ ] Chrome: User stays logged in after reload
- [ ] Firefox: User stays logged in after reload  
- [ ] Brave: User stays logged in after reload (this is the critical test!)
- [ ] Safari: User stays logged in after reload

---

## Troubleshooting Deployment Issues

### Issue: Backend deployed but frontend still has 401 errors

**Causes:**
1. Frontend code was built from old source (cached)
2. Frontend cache not cleared

**Fixes:**
```bash
# In production Vercel UI:
- Go to Deployments
- Click "Redeploy" on the current deployment
- Wait 5-10 minutes for new build

# Or manually force cache clear:
- Ctrl+F5 in browser (hard refresh)
- Or Cmd+Shift+R on Mac
- Or clear browser cache completely
```

### Issue: Backend says "Authorization header not supported"

**Causes:**
1. You merged the fix to wrong branch
2. The backend code change wasn't included in the commit
3. Render is serving an older image

**Fixes:**
```bash
# Verify the file has the changes:
git log backend/src/controllers/auth.controller.js

# Should see recent commit with authorization header fix

# Force redeploy:
git push  # Should trigger new deployment
```

### Issue: Still getting refreshToken expired (401) after deploying

**Causes:**
1. All stored refresh tokens are actually expired
2. User was never logged in properly
3. Database doesn't have the token record

**Fixes:**
1. Users can just login again (will get new tokens)
2. Check: `select count(*) from "RefreshToken";` in database
3. If 0 records, all tokens were deleted (normal if DB was reset)

---

## Production Debugging Commands

### Check if backend has the authorization header fix:

```bash
# SSH into backend or use Render logs
grep -n "authHeader" backend/src/controllers/auth.controller.js

# Should show the Authorization header extraction code
```

### Check if frontend has the Authorization header being sent:

```bash
# In browser DevTools console:
// Make a request that will trigger 401
fetch('https://photowala-5pa7.onrender.com/api/auth/me', {
  headers: { Authorization: 'Bearer invalid-token' },
  credentials: 'include'
}).then(r => console.log(r.status));

# Should see 401 and request should have Authorization header in Network tab
```

### Monitor production logs:

```bash
# Render Backend Logs
- Go to dashboard
- Click on service
- View "Logs"
- Look for "[Auth]" log messages

# Vercel Frontend Logs
- Go to dashboard
- Click on project
- View "Deployments" → "Functions"
```

---

## Rollback Plan

If something breaks after deployment:

1. **Backend Issue:**
   - Go to Render → Select service
   - Click "Recent Deploys"
   - Click "Redeploy" on the previous version

2. **Frontend Issue:**
   - Go to Vercel → Select project
   - Click "Deployments"
   - Click "..." on previous deployment
   - Click "Promote to Production"

---

## Communication Checklist

- [ ] Notify users before deploying (show maintenance banner)
- [ ] Deploy backend first
- [ ] Wait 10 minutes for backend to start
- [ ] Test backend endpoints manually
- [ ] Deploy frontend
- [ ] Wait 5 minutes for frontend build
- [ ] Test login flow in different browsers
- [ ] Monitor error logs for first hour
- [ ] Notify users deployment complete

---

**Last Updated:** May 11, 2026  
**Status:** Awaiting Backend Deployment  
**Estimated Fix Time:** 15-20 minutes after both deployments complete
