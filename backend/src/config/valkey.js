const Redis = require('ioredis');

let client = null;

function getRedisClient() {
  if (!client) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    client = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 5) return null; // stop retrying
        return Math.min(times * 100, 3000);
      },
    });

    client.on('connect', () => console.log('✅ Valkey/Redis connected'));
    client.on('error', (err) => {
      // Don't crash if Redis is unavailable — rate limiting will just be in-memory
      if (err.code !== 'ECONNREFUSED') console.error('⚠️  Redis error:', err.message);
    });
  }
  return client;
}

// Graceful helpers
async function setWithExpiry(key, value, seconds) {
  try {
    const r = getRedisClient();
    await r.set(key, typeof value === 'object' ? JSON.stringify(value) : value, 'EX', seconds);
  } catch { /* silent */ }
}

async function get(key) {
  try {
    const r = getRedisClient();
    const val = await r.get(key);
    try { return JSON.parse(val); } catch { return val; }
  } catch { return null; }
}

async function del(key) {
  try { await getRedisClient().del(key); } catch { /* silent */ }
}

module.exports = { getRedisClient, setWithExpiry, get, del };
