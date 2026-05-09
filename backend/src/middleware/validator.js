const { createError } = require('./errorHandler');

/**
 * Middleware to validate request body against a Zod schema
 * @param {import('zod').ZodSchema} schema 
 */
const validate = (schema) => (req, res, next) => {
  try {
    // Parse handles coercion if needed
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      const zodIssues = error.issues || error.errors || [];

      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: zodIssues.map((e) => ({
          field: e.path ? e.path.join('.') : 'unknown',
          message: e.message,
        })),
      });
    }
    next(error);
  }
};

module.exports = { validate };
