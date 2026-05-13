import { verifyToken } from '../config/paseto.js';
import { createError } from './errorHandler.js';
import prisma from '../lib/prisma.js';

/**
 * Authenticate request — verifies PASETO token from Authorization header or cookie
 */
export async function authenticate(req, res, next) {
  try {
    let token;

    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    // Fall back to httpOnly cookie
    else if (req.cookies?.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      return next(createError('Authentication required', 401));
    }

    const payload = await verifyToken(token);

    if (payload.purpose !== 'access') {
      return next(createError('Invalid token type', 401));
    }

    let role = payload.role;
    let email = payload.email;

    // Some legacy tokens may not carry role/email claims.
    // Hydrate from DB so authorization checks remain reliable.
    if (!role || !email) {
      if (!payload.sub) return next(createError('Invalid token payload', 401));
      const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { email: true, role: true } });
      if (!user) return next(createError('User not found', 401));
      role = role || user.role;
      email = email || user.email;
    }

    // Attach user to request
    req.user = { id: payload.sub, email, role };
    next();
  } catch (err) {
    next(createError('Invalid or expired token', 401));
  }
}

/**
 * isAdmin — Middleware to restrict access to ADMIN or SUPER_ADMIN only
 * Must be used AFTER authenticate
 */
export function isAdmin(req, res, next) {
  if (!req.user) {
    return next(createError('Authentication required', 401));
  }
  const role = String(req.user.role || '').toUpperCase();
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    return next(createError('Admin access required', 403));
  }
  next();
}

/**
 * Authorize — restrict to specific roles (legacy/generic version)
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(createError('Authentication required', 401));
    const allowedRoles = roles.map((role) => String(role).toUpperCase());
    const currentRole = String(req.user.role || '').toUpperCase();
    if (!allowedRoles.includes(currentRole)) {
      return next(createError('Insufficient permissions', 403));
    }
    next();
  };
}

/**
 * Optional authentication — doesn't error if no token
 */
export async function optionalAuth(req, res, next) {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.access_token) {
      token = req.cookies.access_token;
    }

    if (token) {
      const payload = await verifyToken(token);
      if (payload.purpose === 'access') {
        req.user = { id: payload.sub, email: payload.email, role: payload.role };
      }
    }
  } catch (_) {
    // Ignore token errors in optional auth
  }
  next();
}
