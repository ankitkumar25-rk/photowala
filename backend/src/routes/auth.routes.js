const express = require('express');
const router = express.Router();
const { authRateLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');
const authController = require('../controllers/auth.controller');
const passport = require('passport');

const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CALLBACK_URL
);

// Local auth
router.post('/register',      authRateLimiter, authController.register);
router.post('/login',         authRateLimiter, authController.login);
router.post('/logout',        authenticate,    authController.logout);
router.post('/refresh',                        authController.refresh);
router.post('/forgot-password', authRateLimiter, authController.forgotPassword);
router.post('/reset-password',  authRateLimiter, authController.resetPassword);

// Google OAuth
if (googleConfigured) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth` }),
    authController.googleCallback
  );
} else {
  router.get('/google', (req, res) => {
    res.status(503).json({ success: false, message: 'Google OAuth is not configured' });
  });
  router.get('/google/callback', (req, res) => {
    res.status(503).json({ success: false, message: 'Google OAuth is not configured' });
  });
}

// Get current user
router.get('/me', authenticate, authController.getMe);

module.exports = router;
