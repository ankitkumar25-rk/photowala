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
  max: Number(process.env.RATE_LIMIT_MAX) || 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
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

module.exports = { rateLimiter, authRateLimiter };
