import Redis from 'ioredis';

const valkeyUrl = process.env.VALKEY_URL;

if (!valkeyUrl) {
  throw new Error('VALKEY_URL is not defined in environment variables');
}

const isTls = valkeyUrl.startsWith('rediss://');

const valkey = new Redis(valkeyUrl, {
  ...(isTls ? { tls: { rejectUnauthorized: false } } : {}),
  retryStrategy: (times) => {
    const delay = Math.min(times * 100, 2000);
    return times <= 5 ? delay : null; // Max 5 retries
  },
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true; // Reconnect on READONLY errors
    }
    return false;
  },
  enableOfflineQueue: true,
  connectTimeout: 10000,
  commandTimeout: 5000,
  lazyConnect: false,
});

if (process.env.NODE_ENV !== 'production') {
  valkey.on('connect', () => console.log('✔ Valkey connected'));
  valkey.on('error', (err) => console.error('✖ Valkey error:', err.message));
}

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down Valkey...');
  await valkey.quit();
};

process.on('SIGTERM', shutdown);

export default valkey;
