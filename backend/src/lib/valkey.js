import Redis from 'ioredis';

const valkeyUrl = process.env.VALKEY_URL;

if (!valkeyUrl) {
  throw new Error('VALKEY_URL is not defined in environment variables');
}

const isTls = valkeyUrl.startsWith('rediss://');

const valkey = new Redis(valkeyUrl, {
  ...(isTls ? { tls: { rejectUnauthorized: false } } : {}),
  maxRetriesPerRequest: null, // Critical for connect-redis to wait for reconnect
  retryStrategy: (times) => {
    // Exponential backoff with jitter
    const delay = Math.min(times * 200, 5000);
    console.log(`[ioredis] Reconnecting... Attempt ${times}. Next retry in ${delay}ms`);
    return delay; // Keep retrying indefinitely in production
  },
  reconnectOnError: (err) => {
    const targetErrors = ['READONLY', 'ECONNRESET', 'EPIPE', 'ETIMEDOUT'];
    if (targetErrors.some(te => err.message.includes(te))) {
      return true; 
    }
    return false;
  },
  enableOfflineQueue: true,
  connectTimeout: 15000,
  commandTimeout: 10000,
  lazyConnect: false,
});

valkey.on('connect', () => console.log('✔ Valkey connected'));
valkey.on('ready', () => console.log('✔ Valkey ready to receive commands'));
valkey.on('error', (err) => console.error('✖ Valkey error:', err.message));
valkey.on('reconnecting', () => console.warn('⚠ Valkey reconnecting...'));
valkey.on('end', () => console.warn('✖ Valkey connection ended'));


// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down Valkey...');
  await valkey.quit();
};

process.on('SIGTERM', shutdown);

export default valkey;
