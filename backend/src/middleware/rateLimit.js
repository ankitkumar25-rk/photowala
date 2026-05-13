import valkey from '../lib/valkey.js';

export const rateLimit = ({ max, windowSec, keyPrefix = 'rl' }) => {
  return async (req, res, next) => {
    // Skip if no valkey connection (fallback to allow request)
    if (!valkey) return next();

    const ip = req.headers['x-forwarded-for'] || req.ip;
    const key = `${keyPrefix}:${ip}`;

    try {
      const pipeline = valkey.multi();
      pipeline.incr(key);
      pipeline.expire(key, windowSec);
      
      const results = await pipeline.exec();
      const current = results[0][1];

      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current));

      if (current > max) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests, please try again later.'
        });
      }
      next();
    } catch (err) {
      console.error('Rate Limit Error:', err.message);
      next();
    }
  };
};

export const authRateLimiter = rateLimit({ 
  max: 10, 
  windowSec: 15 * 60, 
  keyPrefix: 'rl:auth' 
});
