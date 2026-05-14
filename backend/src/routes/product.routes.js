import express from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../middleware/auth.js';
import * as productController from '../controllers/product.controller.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

// Public routes
router.get('/',          productController.listProducts);
router.get('/featured',  productController.getFeatured);
router.get('/search',    productController.searchProducts);
router.get('/id/:id',    authenticate, authorize('ADMIN', 'SUPER_ADMIN'), productController.getProductById);
router.get('/:slug',     productController.getProduct);

// Admin only
router.post('/',            authenticate, authorize('ADMIN', 'SUPER_ADMIN'), upload.array('images', 3), productController.createProduct);
router.put('/:id',          authenticate, authorize('ADMIN', 'SUPER_ADMIN'), upload.array('images', 3), productController.updateProduct);
router.delete('/:id',       authenticate, authorize('ADMIN', 'SUPER_ADMIN'), productController.deleteProduct);
router.patch('/:id/stock',  authenticate, authorize('ADMIN', 'SUPER_ADMIN'), productController.updateStock);

export default router;
