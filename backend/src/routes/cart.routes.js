import express from 'express';
import { optionalAuth, authenticate } from '../middleware/auth.js';
import * as cartController from '../controllers/cart.controller.js';

const router = express.Router();

// All cart routes support both guest and authenticated users
router.get('/',           optionalAuth, cartController.getCart);
router.post('/add',       optionalAuth, cartController.addToCart);
router.put('/update',     optionalAuth, cartController.updateCartItem);
router.delete('/remove',  optionalAuth, cartController.removeFromCart);
router.delete('/clear',   optionalAuth, cartController.clearCart);

// Merge guest cart into user cart after login
router.post('/merge', authenticate, cartController.mergeCart);

export default router;
