import crypto from 'crypto';
import { createError } from './errorHandler.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const EXEMPT_PATHS = new Set([
  '/api/payments/webhook',
  '/api/auth/google',          // Initial OAuth redirect to Google
  '/api/auth/google/callback', // OAuth callback from Google redirect
]);

const cookieOptions = {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export function issueCsrfToken(res) {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie('csrf_token', token, cookieOptions);
  return token;
}

export function ensureCsrfCookie(req, res, next) {
  if (!req.cookies?.csrf_token) {
    issueCsrfToken(res);
  }
  next();
}

function secureCompare(a, b) {
  if (!a || !b) return false;
  const left = Buffer.from(String(a), 'utf8');
  const right = Buffer.from(String(b), 'utf8');
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function requireCsrf(req, res, next) {
  // 1. Skip safe methods
  if (SAFE_METHODS.has(req.method)) return next();
  
  // 2. Skip exempt paths
  const routePath = `${req.baseUrl || ''}${req.path || ''}`;
  if (EXEMPT_PATHS.has(routePath)) return next();

  // 3. Validate double-submit cookie
  const cookieToken = req.cookies?.csrf_token;
  const headerToken = req.get('x-csrf-token');

  if (!cookieToken || !headerToken || !secureCompare(cookieToken, headerToken)) {
    console.error(`[CSRF] Denial: Method: ${req.method}, Path: ${routePath}. Cookie: ${!!cookieToken}, Header: ${!!headerToken}`);
    return next(createError('CSRF validation failed. Please refresh the page.', 403));
  }

  next();
}
