const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const categoryController = require('../controllers/category.controller');

router.get('/',     categoryController.listCategories);
router.get('/:slug', categoryController.getCategory);

router.post('/',      authenticate, authorize('ADMIN', 'SUPER_ADMIN'), categoryController.createCategory);
router.put('/:id',    authenticate, authorize('ADMIN', 'SUPER_ADMIN'), categoryController.updateCategory);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), categoryController.deleteCategory);

module.exports = router;
