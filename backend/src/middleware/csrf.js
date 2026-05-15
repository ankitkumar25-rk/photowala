import crypto from 'crypto';
import { createError } from './errorHandler.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const EXEMPT_PATHS = new Set([
  '/api/payments/webhook',
  '/api/auth/google',          // Initial OAuth redirect to Google
  '/api/auth/google/callback', // OAuth callback from Google redirect
]);

const cookieOptions = {
  httpOnly: false,      // MUST be false — frontend JS needs to read it
  secure: true,         // true in production (HTTPS)
  sameSite: 'none',     // MUST be 'none' for cross-origin (Vercel → VPS)
  path: '/',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

export function issueCsrfToken(res) {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie('csrf_token', token, cookieOptions);
  return token;
}

export function ensureCsrfCookie(req, res, next) {
  try {
    const existingToken = req.cookies?.csrf_token;
    if (existingToken && existingToken.length === 64) {
      return next(); // valid token exists, do not overwrite
    }
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie('csrf_token', token, cookieOptions);
    next();
  } catch (err) {
    console.error('[CSRF] ensureCsrfCookie error:', err.message);
    next(); // never block the request due to CSRF cookie error
  }
}

function secureCompare(a, b) {
  if (!a || !b) return false;
  const left = Buffer.from(String(a), 'utf8');
  const right = Buffer.from(String(b), 'utf8');
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function requireCsrf(req, res, next) {
  try {
    // 1. Skip safe methods
    if (SAFE_METHODS.has(req.method)) return next();
    
    // 2. Skip exempt paths
    const routePath = `${req.baseUrl || ''}${req.path || ''}`;
    if (EXEMPT_PATHS.has(routePath)) return next();

    // 3. Validate double-submit cookie
    const cookieToken = req.cookies?.csrf_token;
    const headerToken =
      req.headers['x-csrf-token'] ||
      req.headers['x-xsrf-token'] ||
      req.headers['X-CSRF-Token'];

    // Temporary debug — remove after confirming fix
    console.log('[CSRF Check]', {
      method: req.method,
      path: routePath,
      hasCookie: !!cookieToken,
      hasHeader: !!headerToken,
      match: cookieToken === headerToken,
      cookieSnippet: cookieToken?.slice(0, 8),
      headerSnippet: headerToken?.slice(0, 8),
    });

    if (!cookieToken || !headerToken) {
      console.error(`[CSRF] Denial: Missing tokens. Cookie: ${!!cookieToken}, Header: ${!!headerToken}`);
      return next(createError('CSRF token missing', 403));
    }

    if (!secureCompare(cookieToken, headerToken)) {
      console.error(`[CSRF] Denial: Token mismatch. Path: ${routePath}`);
      return next(createError('CSRF validation failed. Please refresh the page.', 403));
    }

    next();
  } catch (err) {
    console.error('[CSRF] requireCsrf error:', err.message);
    next(createError('CSRF check failed', 500));
  }
}
