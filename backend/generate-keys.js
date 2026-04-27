const crypto = require('crypto');

// Generate a 32-byte hex key for PASETO (symmetric v4.local)
const pasetoKey = crypto.randomBytes(32).toString('hex');
const sessionKey = crypto.randomBytes(48).toString('base64url');

console.log('\n🔑  Add these to your backend/.env file:\n');
console.log(`PASETO_SECRET_KEY=${pasetoKey}`);
console.log(`SESSION_SECRET=${sessionKey}`);
console.log('\n✅  Done! Keep these secret and never commit them to git.\n');
