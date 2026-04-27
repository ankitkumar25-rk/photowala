const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const userController = require('../controllers/user.controller');

router.get('/profile',             authenticate, userController.getProfile);
router.put('/profile',             authenticate, userController.updateProfile);
router.put('/change-password',     authenticate, userController.changePassword);

// Addresses
router.get('/addresses',           authenticate, userController.getAddresses);
router.post('/addresses',          authenticate, userController.addAddress);
router.put('/addresses/:id',       authenticate, userController.updateAddress);
router.delete('/addresses/:id',    authenticate, userController.deleteAddress);
router.patch('/addresses/:id/default', authenticate, userController.setDefaultAddress);

// Wishlist
router.get('/wishlist',            authenticate, userController.getWishlist);
router.post('/wishlist/:productId', authenticate, userController.addToWishlist);
router.delete('/wishlist/:productId', authenticate, userController.removeFromWishlist);

// Reviews
router.post('/reviews',            authenticate, userController.addReview);

module.exports = router;
