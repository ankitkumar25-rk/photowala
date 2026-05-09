const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL;
const redis = redisUrl
  ? new Redis(redisUrl, {
    enableOfflineQueue: true,
    maxRetriesPerRequest: 2,
    retryStrategy: (times) => Math.min(times * 200, 2000),
  })
  : null;

if (redis) {
  redis.on('error', (err) => {
    console.warn('[rate-limit] Redis error:', err?.message || err);
  });
}

function buildRedisStore(prefix) {
  if (!redis) return undefined;
  return new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix,
  });
}

const rateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max: Number(process.env.RATE_LIMIT_MAX) || 5000, // Increased from 1000 to 5000
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
  // Skip rate limiting for GET /auth/me (authenticated users fetching their profile)
  skip: (req) => req.method === 'GET' && req.path === '/auth/me',
  ...(redis ? { store: buildRedisStore('rl:global:') } : {}),
});

// Stricter limiter for auth routes
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, please try again in 15 minutes.' },
  ...(redis ? { store: buildRedisStore('rl:auth:') } : {}),
});

// Service order rate limiter: 10 requests per minute
const serviceRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many order attempts, please try again in a minute.' },
  ...(redis ? { store: buildRedisStore('rl:services:') } : {}),
});

module.exports = { rateLimiter, authRateLimiter, serviceRateLimiter };
