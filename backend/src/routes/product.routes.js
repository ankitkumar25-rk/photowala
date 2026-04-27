const express = require('express');
const router = express.Router();
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const productController = require('../controllers/product.controller');

// Public routes
router.get('/',          productController.listProducts);
router.get('/featured',  productController.getFeatured);
router.get('/search',    productController.searchProducts);
router.get('/id/:id',    authenticate, authorize('ADMIN', 'SUPER_ADMIN'), productController.getProductById);
router.get('/:slug',     productController.getProduct);

// Admin only
router.post('/',            authenticate, authorize('ADMIN', 'SUPER_ADMIN'), productController.createProduct);
router.put('/:id',          authenticate, authorize('ADMIN', 'SUPER_ADMIN'), productController.updateProduct);
router.delete('/:id',       authenticate, authorize('ADMIN', 'SUPER_ADMIN'), productController.deleteProduct);
router.patch('/:id/stock',  authenticate, authorize('ADMIN', 'SUPER_ADMIN'), productController.updateStock);

module.exports = router;
