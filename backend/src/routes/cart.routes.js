const express = require('express');
const router = express.Router();
const { optionalAuth, authenticate } = require('../middleware/auth');
const cartController = require('../controllers/cart.controller');

// All cart routes support both guest and authenticated users
router.get('/',           optionalAuth, cartController.getCart);
router.post('/add',       optionalAuth, cartController.addToCart);
router.put('/update',     optionalAuth, cartController.updateCartItem);
router.delete('/remove',  optionalAuth, cartController.removeFromCart);
router.delete('/clear',   optionalAuth, cartController.clearCart);

// Merge guest cart into user cart after login
router.post('/merge', authenticate, cartController.mergeCart);

module.exports = router;
