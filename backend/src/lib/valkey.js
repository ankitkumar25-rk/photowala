import Redis from 'ioredis';

const valkeyUrl = process.env.VALKEY_URL || process.env.REDIS_URL;

if (!valkeyUrl) {
  console.warn('⚠ VALKEY_URL is not defined. Redis-based features will be disabled.');
}

const valkey = valkeyUrl ? new Redis(valkeyUrl, {
  // tls: {}, // Removed Upstash-specific TLS requirement
  maxRetriesPerRequest: 20,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return times <= 10 ? delay : null; // Increased retries for local stability
  },
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
  enableOfflineQueue: true,
  connectTimeout: 5000,
  commandTimeout: 3000,
  lazyConnect: false,
}) : null;

if (valkey && process.env.NODE_ENV !== 'production') {
  valkey.on('connect', () => console.log('✔ Valkey connected'));
  valkey.on('error', (err) => console.error('✖ Valkey error:', err.message));
}

// Graceful shutdown
const shutdown = async () => {
  if (valkey) {
    console.log('Shutting down Valkey...');
    await valkey.quit();
  }
};

process.on('SIGTERM', shutdown);

export default valkey;
