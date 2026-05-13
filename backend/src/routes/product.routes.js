import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as productController from '../controllers/product.controller.js';

const router = express.Router();

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

export default router;
