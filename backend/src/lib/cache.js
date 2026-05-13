import valkey from './valkey.js';

export const cache = {
  async get(key) {
    try {
      const data = await valkey.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error(`Cache Get Error [${key}]:`, err.message);
      return null;
    }
  },

  async set(key, value, ttlSeconds = 300) {
    try {
      const data = JSON.stringify(value);
      await valkey.set(key, data, 'EX', ttlSeconds);
      return true;
    } catch (err) {
      console.error(`Cache Set Error [${key}]:`, err.message);
      return false;
    }
  },

  async del(key) {
    try {
      await valkey.del(key);
      return true;
    } catch (err) {
      console.error(`Cache Del Error [${key}]:`, err.message);
      return false;
    }
  },

  async exists(key) {
    try {
      const count = await valkey.exists(key);
      return count > 0;
    } catch (err) {
      console.error(`Cache Exists Error [${key}]:`, err.message);
      return false;
    }
  },

  async setRaw(key, value, ttlSeconds = 300) {
    try {
      await valkey.set(key, value, 'EX', ttlSeconds);
      return true;
    } catch (err) {
      console.error(`Cache SetRaw Error [${key}]:`, err.message);
      return false;
    }
  },

  async getRaw(key) {
    try {
      return await valkey.get(key);
    } catch (err) {
      console.error(`Cache GetRaw Error [${key}]:`, err.message);
      return null;
    }
  }
};
