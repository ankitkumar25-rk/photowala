import { createError } from './errorHandler.js';

/**
 * requireRole — Restrict access to specific roles
 * Must be used AFTER authenticate
 * 
 * @param {string|string[]} allowedRoles - Single role or array of roles allowed to access
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError('Authentication required', 401));
    }

    const currentRole = String(req.user.role || '').toUpperCase();
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const normalizedRoles = roles.map(r => String(r).toUpperCase());

    if (!normalizedRoles.includes(currentRole)) {
      return next(createError(`Insufficient permissions: ${currentRole} cannot access this resource`, 403));
    }

    next();
  };
};
