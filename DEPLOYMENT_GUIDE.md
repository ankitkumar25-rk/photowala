# Token Storage Bug - Deployment & Production Guide

## Problem Statement
After login or Google OAuth, refreshToken was not being saved to localStorage, causing users to be logged out on every page reload. Backend was returning correct response format but frontend had no logging/error handling to detect the issue.

## Solution Deployed  
Enhanced logging and validation in token extraction logic to make debugging trivial:
1. Log full response structure during login
2. Throw error if refreshToken missing
3. Show URL params during OAuth callback
4. Confirmed axios client has proper key consistency

## Deployment Checklist

### Before Deploying to Production

#### Backend (Render)
- [ ] Ensure Redis/Valkey is running in production
- [ ] Uncomment `REDIS_URL=redis://...` in backend `.env` (currently commented for testing)
- [ ] Verify DATABASE_URL points to correct PostgreSQL instance
- [ ] Test login endpoint returns refreshToken: 
  ```bash
  curl -X POST https://photowala-backend.render.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@photowala.com","password":"password"}'
  ```
  Response should include `refreshToken` field

#### Frontend Store (Vercel)
- [ ] Build passes: `npm run build`
- [ ] No TypeScript/ESLint errors
- [ ] Environment variables set in Vercel dashboard:
  - `VITE_API_BASE_URL=https://photowala-backend.render.com/api`

#### Frontend Admin (Vercel)
- [ ] Same checks as frontend-store

### After Deploying

#### Immediate Testing (Within 1 hour)
1. **Test Login Flow**
   - Open https://photowala.vercel.app/login in Chrome
   - DevTools → Console
   - Login with valid credentials
   - Check for logs:
     ```
     [Auth] Login response structure: {...}
     [Auth] Tokens saved: { token: true, refreshToken: true }
     ```
   - Check LocalStorage for 'token' and 'refreshToken' keys
   - Reload page - should stay logged in

2. **Test Google OAuth**
   - Click "Sign in with Google"
   - After redirect, check console for:
     ```
     [Auth] AuthSuccess callback - URL params: { accessToken: true, refreshToken: true }
     ```
   - Check LocalStorage for tokens

3. **Monitor for 401 Errors**
   - Keep browser open for 15 minutes (access token expiry)
   - Make any API call (refresh page, load products)
   - Should NOT see 401 error
   - Should see refresh attempt succeed silently

#### Production Monitoring (First 24 hours)

**Metrics to Watch:**
- Error logs for "Refresh token required" 
  - If occurring: Token not being extracted or sent in Authorization header
  - Action: Check localStorage extraction in frontend or Authorization header sending in axios
  
- Error logs for "Invalid token"
  - If occurring frequently: Tokens expiring too quickly or being invalidated
  - Action: Check token expiry times in backend config

- API endpoint latency
  - If refresh endpoint slow: Redis connection issue
  - Action: Check Redis/Valkey health

- User complaints about unexpected logouts
  - Indicates tokens not persisting to localStorage
  - Action: Check browser console logs from user sessions

**Check These Logs:**
```
# Backend logs (Render)
- "[Auth] Tokens saved" - frequency of successful logins
- "Refresh token required" - indicates missing or null token
- "Invalid token" - indicates token validation failure

# Frontend logs (Browser Console)
- "[Auth] Login response structure" - shows response for login
- "[Auth] Tokens saved" - confirms localStorage keys created
- Network errors - check status codes and responses
```

#### Production Rollback Criteria
If any of these occur in first hour, rollback immediately:
- > 5% of API calls returning 401
- Error message "Refresh token required" appearing frequently
- New user unable to login or stay logged in
- Google OAuth redirect not working

---

## Troubleshooting Production Issues

### Issue: "Refresh token required" errors appearing in logs

**Diagnosis:**
1. Is refreshToken being saved to localStorage?
   - Ask user to check: DevTools → Application → LocalStorage → 'refreshToken' key
   - If missing: Token not extracted during login (our fix would catch this)
   - If present: Token not being sent in Authorization header during refresh

2. Run diagnostic:
   ```javascript
   // User runs in browser console after login
   const token = localStorage.getItem('refreshToken');
   console.log('refreshToken present:', !!token);
   console.log('refreshToken length:', token?.length);
   ```

3. Check frontend logs:
   - Should have seen `[Auth] Login response structure:` log
   - Should have seen `[Auth] Tokens saved: { token: true, refreshToken: true }` log
   - If missing: User cleared localStorage or browser privacy mode blocking it

**Fix:**
- If logs show tokens saved but still getting 401: Backend issue, check refresh endpoint
- If logs missing: Frontend not running latest code, clear cache and hard-reload (Ctrl+F5)
- If in production privacy mode: Not a bug, working as designed

### Issue: Users getting logged out after page reload

**Diagnosis:**
1. Check if localStorage persists:
   ```javascript
   // In console after login
   localStorage.setItem('test', 'value');
   console.log(localStorage.getItem('test'));
   // If returns 'value': localStorage working
   // If returns null: localStorage disabled (privacy mode)
   ```

2. Check axios token extraction:
   ```javascript
   // In console
   const token = localStorage.getItem('token');
   console.log('Token in localStorage:', !!token);
   // Should be true after login
   ```

3. Check if refresh endpoint called:
   - Network tab → filter "refresh"
   - After page reload, should see POST /api/auth/refresh
   - If not present: Token not in localStorage or axios not sending it

**Fix:**
- Clear browser cache: Ctrl+Shift+Delete (not private mode)
- Hard reload: Ctrl+F5
- Check browser privacy/security settings aren't blocking localStorage

### Issue: Google OAuth callback not working

**Diagnosis:**
1. Check redirect URL parameter:
   - After clicking "Sign in with Google", redirect URL should be:
   - `https://photowala.vercel.app/auth/success?access_token=...&refresh_token=...`
   - If no parameters: Backend not passing tokens
   - If only one token: Backend only returning one token type

2. Check browser console at redirect:
   - Should show: `[Auth] AuthSuccess callback - URL params:`
   - If not showing: AuthSuccess.jsx component not loading

3. Check fetchMe call:
   - Should see: `[Auth] fetchMe successful` OR error message
   - If hanging: API call failing or /auth/me endpoint broken

**Fix:**
- Verify backend `process.env.CLIENT_URL` points to correct frontend URL
- Check backend `googleCallback` function returns both access_token and refresh_token
- If callback page not loading: Check frontend routing, ensure `/auth/success` route exists

---

## Monitoring Commands

### Backend (Node.js on Render)
```bash
# Check recent 100 lines of logs
logs | tail -100 | grep -E "\[Auth\]|error|token"

# Check for rate limit issues
logs | grep "rate"

# Check for database issues
logs | grep "database|prisma"
```

### Frontend (Vercel)
```bash
# Check function logs if using API routes
# No direct server-side logs for frontend
# Rely on browser console logs or Sentry integration

# Monitor build logs for deployment issues
# Check environment variables are set correctly
```

---

## Rollout Strategy

### Phase 1: Testing (Local - COMPLETE)
- ✅ Modified frontend-store store/index.js with enhanced logging
- ✅ Modified frontend-store pages/AuthSuccess.jsx with validation
- ✅ Verified axios client is correct
- ✅ Commented out REDIS_URL in backend for testing

### Phase 2: Staging Deployment (If available)
- [ ] Deploy frontend changes to staging Vercel preview
- [ ] Deploy backend changes to staging Render
- [ ] Test both login flows (email/Google)
- [ ] Monitor staging logs for errors
- [ ] Verify tokens save to localStorage
- [ ] Test token refresh after 15+ minutes

### Phase 3: Production Deployment  
- [ ] Uncomment REDIS_URL in backend .env
- [ ] Deploy backend to Render (git push)
- [ ] Deploy frontend-store to Vercel (git push)
- [ ] Deploy frontend-admin to Vercel (git push)
- [ ] Monitor production logs for first hour
- [ ] Test both login flows in production
- [ ] Monitor user feedback for unexpected logouts

### Phase 4: Post-Deployment Monitoring (24 hours)
- [ ] Check error logs for "Refresh token required" (should be zero)
- [ ] Check login success rate (should be ~100%)
- [ ] Check token refresh success rate (should be ~100%)
- [ ] Monitor for new error patterns
- [ ] Verify no increase in API errors or 401 responses

---

## Rollback Procedure

If critical issues found after deployment:

```bash
# Backend Rollback (Render)
# Revert to previous commit
git revert HEAD
git push  # Automatic redeploy on Render

# Frontend Rollback (Vercel)
# Revert to previous deployment via Vercel dashboard
# OR revert commits and push
git revert HEAD
git push  # Automatic redeploy on Vercel
```

**Rollback Triggers:**
- > 10% 401 errors
- User unable to login
- User unable to stay logged in after reload
- Google OAuth completely broken

---

## Success Criteria

After 24 hours, consider deployment successful if:
- ✅ No "Refresh token required" errors in logs
- ✅ Users able to login and stay logged in after reload
- ✅ Google OAuth working for new users
- ✅ No unexpected 401 errors
- ✅ No increase in API response times
- ✅ Zero user complaints about logouts

---

## Files to Deploy

### Backend (Render)
- No code changes to backend
- Just uncomment REDIS_URL in `.env` when ready for production

### Frontend Store (Vercel)
- `src/store/index.js` - Enhanced login/register with logging
- `src/pages/AuthSuccess.jsx` - Enhanced OAuth callback with validation

### Frontend Admin (Vercel)
- No changes needed (not affected by this token storage bug)

---

## Post-Deployment Support

If users report issues:
1. Ask them to check browser console for `[Auth]` logs
2. Ask them to check LocalStorage for 'token' and 'refreshToken' keys
3. Collect full console output for debugging
4. Check backend logs for matching timestamp
5. Cross-reference with production error logs
