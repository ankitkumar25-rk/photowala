const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const orderController = require('../controllers/order.controller');

// Customer routes
router.post('/',            authenticate, orderController.createOrder);
router.get('/',             authenticate, orderController.getUserOrders);
router.post('/pen/laser',   authenticate, orderController.createLaserPenOrder);

// Admin routes
router.get('/admin/all',        authenticate, authorize('ADMIN', 'SUPER_ADMIN'), orderController.getAllOrders);
router.patch('/:id/status',     authenticate, authorize('ADMIN', 'SUPER_ADMIN'), orderController.updateOrderStatus);
router.patch('/:id/tracking',   authenticate, authorize('ADMIN', 'SUPER_ADMIN'), orderController.updateTracking);

router.get('/:id',          authenticate, orderController.getOrder);
router.post('/:id/cancel',  authenticate, orderController.cancelOrder);

module.exports = router;
