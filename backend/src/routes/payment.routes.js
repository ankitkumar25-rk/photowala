const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const paymentController = require('../controllers/payment.controller');

router.post('/create-order',  authenticate, paymentController.createRazorpayOrder);
router.post('/verify',        authenticate, paymentController.verifyPayment);
router.post('/webhook',                     paymentController.webhook);  // raw body set in app.js

module.exports = router;
