const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth');
const { requireCsrf } = require('../middleware/csrf');

// We don't apply global middleware here because webhook needs raw body and NO auth
router.post('/create-order', authenticate, requireCsrf, paymentController.createRazorpayOrder);
router.post('/verify',       authenticate, requireCsrf, paymentController.verifyPayment);
router.post('/cod',          authenticate, requireCsrf, paymentController.confirmCOD);

// Webhook is registered separately in app.js to handle the raw body correctly
// router.post('/webhook', ...) 

module.exports = router;
