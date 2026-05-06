const crypto = require('crypto');
const { createError } = require('./errorHandler');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const EXEMPT_PATHS = new Set([
  '/api/payments/webhook',
]);
const TRUSTED_ORIGINS = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean).map((origin) => String(origin).replace(/\/$/, ''));

const cookieOptions = {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function issueCsrfToken(res) {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie('csrf_token', token, cookieOptions);
  return token;
}

function ensureCsrfCookie(req, res, next) {
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

function requireCsrf(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();
  const routePath = `${req.baseUrl || ''}${req.path || ''}`;
  if (EXEMPT_PATHS.has(routePath)) return next();

  const cookieToken = req.cookies?.csrf_token;
  const headerToken = req.get('x-csrf-token');
  if (secureCompare(cookieToken, headerToken)) {
    return next();
  }

  // Fallback for cross-site deployments where browsers may block third-party
  // CSRF cookies. Only allow unsafe requests from explicitly trusted origins.
  const origin = String(req.get('origin') || '').replace(/\/$/, '');
  const referer = req.get('referer');
  const refererOrigin = (() => {
    if (!referer) return '';
    try {
      return new URL(referer).origin.replace(/\/$/, '');
    } catch {
      return '';
    }
  })();

  const trusted = (origin && TRUSTED_ORIGINS.includes(origin))
    || (refererOrigin && TRUSTED_ORIGINS.includes(refererOrigin));

  if (!trusted) {
    return next(createError('Invalid CSRF token', 403));
  }

  next();
}

module.exports = { ensureCsrfCookie, requireCsrf };
