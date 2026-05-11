const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { requireCsrf } = require('../middleware/csrf');

// Customer routes
router.post('/create-order', authenticate, requireCsrf, paymentController.createRazorpayOrder);
router.post('/verify',       authenticate, requireCsrf, paymentController.verifyPayment);
router.post('/cod',          authenticate, requireCsrf, paymentController.confirmCOD);

// Admin route for processing refunds
router.post('/refund', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), requireCsrf, paymentController.processRefund);

// Webhook is registered separately in app.js to handle the raw body correctly
// router.post('/webhook', ...) 

module.exports = router;
