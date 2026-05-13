import Redis from 'ioredis';

let client = null;

export function getRedisClient() {
  if (!client) {
    const redisUrl = process.env.VALKEY_URL || process.env.REDIS_URL || 'redis://localhost:6379';
    client = new Redis(redisUrl, {
      tls: redisUrl.startsWith('rediss://') ? {} : undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 5) return null; // stop retrying
        return Math.min(times * 100, 3000);
      },
    });

    client.on('connect', () => console.log('✅ Valkey/Redis connected'));
    client.on('error', (err) => {
      if (err.code !== 'ECONNREFUSED') console.error('⚠️  Redis error:', err.message);
    });
  }
  return client;
}

// Graceful helpers
export async function setWithExpiry(key, value, seconds) {
  try {
    const r = getRedisClient();
    await r.set(key, typeof value === 'object' ? JSON.stringify(value) : value, 'EX', seconds);
  } catch (err) {
    console.error(`[valkey] setWithExpiry error: ${err.message}`);
  }
}

export async function get(key) {
  try {
    const r = getRedisClient();
    const val = await r.get(key);
    if (!val) return null;
    try { return JSON.parse(val); } catch { return val; }
  } catch (err) {
    console.error(`[valkey] get error: ${err.message}`);
    return null;
  }
}

export async function del(key) {
  try {
    const r = getRedisClient();
    await r.del(key);
  } catch (err) {
    console.error(`[valkey] del error: ${err.message}`);
  }
}

export default { getRedisClient, setWithExpiry, get, del };
