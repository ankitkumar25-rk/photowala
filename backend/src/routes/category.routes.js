import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as categoryController from '../controllers/category.controller.js';

const router = express.Router();

router.get('/',     categoryController.listCategories);
router.get('/:slug', categoryController.getCategory);

router.post('/',      authenticate, authorize('ADMIN', 'SUPER_ADMIN'), categoryController.createCategory);
router.put('/:id',    authenticate, authorize('ADMIN', 'SUPER_ADMIN'), categoryController.updateCategory);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), categoryController.deleteCategory);

export default router;
