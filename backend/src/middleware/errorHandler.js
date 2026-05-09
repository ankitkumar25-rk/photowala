/**
 * Centralised error handler middleware
 * Must be the last middleware in the stack
 */
function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${err.message}`, err.stack);

  // Prisma errors
  if (err.code === 'P2002') {
    const fields = Array.isArray(err.meta?.target) ? err.meta.target : [];
    const fieldLabel = fields.length ? ` (${fields.join(', ')})` : '';
    return res.status(409).json({
      success: false,
      message: `A record with this value already exists${fieldLabel}.`,
    });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found.',
    });
  }
  if (err.code === 'P2021') {
    return res.status(500).json({
      success: false,
      message: 'Database schema is missing a required table. Run Prisma deploy/push against the production database.',
    });
  }

  // Validation errors (Zod)
  if (err.name === 'ZodError') {
    const zodIssues = err.issues || err.errors || [];

    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: zodIssues.map((e) => ({
        field: e.path ? e.path.join('.') : 'unknown',
        message: e.message,
      })),
    });
  }

  // Auth errors
  if (err.name === 'PasetoClaimInvalid' || err.name === 'PasetoDecryptionFailed') {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * Create an API error with a custom status code
 */
function createError(message, statusCode = 500) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

module.exports = { errorHandler, createError };
