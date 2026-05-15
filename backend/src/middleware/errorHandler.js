/**
 * Centralised error handler middleware
 * Must be the last middleware in the stack
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || err.error?.description || 'Internal server error';

  console.error(`[ERROR] ${statusCode} - ${message}`, err.stack);

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
    const zodIssues = Array.isArray(err.issues)
      ? err.issues
      : (Array.isArray(err.errors) ? err.errors : []);

    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: zodIssues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Auth errors
  if (err.name === 'PasetoClaimInvalid' || err.name === 'PasetoDecryptionFailed') {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }

  const isProd = process.env.NODE_ENV === 'production';
  const displayMessage = (statusCode >= 500 && isProd) ? 'Internal server error' : message;

  res.status(statusCode).json({
    success: false,
    message: displayMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * Create an API error with a custom status code
 */
export function createError(message, statusCode = 500) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}
