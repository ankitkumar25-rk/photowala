import Redis from 'ioredis';

const valkeyUrl = process.env.VALKEY_URL;

if (!valkeyUrl) {
  throw new Error('VALKEY_URL is not defined in environment variables');
}

const valkey = new Redis(valkeyUrl, {
  // tls: {}, // Removed Upstash-specific TLS requirement
  maxRetriesPerRequest: null,
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
