// Using PASETO v3.local — symmetric encryption (AES-256-CTR + HMAC-SHA384)
// The installed 'paseto' package exposes V3.encrypt/decrypt for local tokens.
const { V3 } = require('paseto');
const { createSecretKey } = require('crypto');

// PASETO v3 local requires a 32-byte key
function getSecretKey() {
  const hexKey = process.env.PASETO_SECRET_KEY;
  if (!hexKey || hexKey.length < 64) {
    throw new Error('PASETO_SECRET_KEY must be 64 hex chars (32 bytes). Run: node generate-keys.js');
  }
  return createSecretKey(Buffer.from(hexKey.slice(0, 64), 'hex'));
}

/**
 * Issue a PASETO access token (15 min by default)
 */
async function signAccessToken(payload) {
  const key = getSecretKey();
  return V3.encrypt(
    { ...payload, purpose: 'access' },
    key,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15 minutes' }
  );
}

/**
 * Issue a PASETO refresh token (7 days by default)
 */
async function signRefreshToken(payload) {
  const key = getSecretKey();
  return V3.encrypt(
    { ...payload, purpose: 'refresh' },
    key,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7 days' }
  );
}

/**
 * Verify and decrypt a PASETO token
 * Throws if invalid, expired, or tampered
 */
async function verifyToken(token) {
  const key = getSecretKey();
  return V3.decrypt(token, key);
}

module.exports = { signAccessToken, signRefreshToken, verifyToken };
