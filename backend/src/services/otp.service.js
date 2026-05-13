import crypto from 'crypto';
import { cache } from '../lib/cache.js';

export const otpService = {
  async generateOtp(userId) {
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpKey = `otp:${userId}`;
    const attemptKey = `otp:attempts:${userId}`;

    await cache.setRaw(otpKey, otp, 300);
    await cache.setRaw(attemptKey, '0', 300);
    
    return otp;
  },

  async verifyOtp(userId, inputOtp) {
    const otpKey = `otp:${userId}`;
    const attemptKey = `otp:attempts:${userId}`;

    const storedOtp = await cache.getRaw(otpKey);
    if (!storedOtp) {
      throw new Error('OTP expired or not found');
    }

    const attempts = parseInt(await cache.getRaw(attemptKey) || '0');
    if (attempts >= 3) {
      await cache.del(otpKey);
      await cache.del(attemptKey);
      throw new Error('Too many failed attempts. Please request a new OTP.');
    }

    if (storedOtp !== inputOtp) {
      await cache.setRaw(attemptKey, (attempts + 1).toString(), 300);
      throw new Error('Invalid OTP');
    }

    // Success
    await cache.del(otpKey);
    await cache.del(attemptKey);
    return true;
  }
};
