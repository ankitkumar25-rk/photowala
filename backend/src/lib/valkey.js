import Redis from 'ioredis';

const valkeyUrl = process.env.VALKEY_URL || process.env.REDIS_URL;

if (!valkeyUrl) {
  console.warn('⚠ VALKEY_URL is not defined. Redis-based features will be disabled.');
}

const valkey = valkeyUrl ? new Redis(valkeyUrl, {
  // tls: {}, // Removed Upstash-specific TLS requirement
  maxRetriesPerRequest: 20,
  retryStrategy: (times) => {
    // Keep retrying forever with a maximum delay of 5 seconds
    return Math.min(times * 100, 5000);
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

if (valkey) {
  valkey.on('connect', () => console.log('✔ Valkey connected'));
  valkey.on('error', (err) => {
    // Silently log ECONNRESET to avoid spam, but log other errors as critical
    if (err.message.includes('ECONNRESET')) {
      console.warn('⚠ Valkey: Connection reset by peer');
    } else {
      console.error('✖ Valkey error:', err.message);
    }
  });
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
