const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const serviceOrderController = require('../controllers/serviceOrder.controller');

// Customer routes
router.post('/',                authenticate, serviceOrderController.createServiceOrder);
router.get('/my',               authenticate, serviceOrderController.getMyServiceOrders);
router.get('/:id',              authenticate, serviceOrderController.getServiceOrderDetail);

// Admin routes
router.get('/admin/all',        authenticate, authorize('ADMIN', 'SUPER_ADMIN'), serviceOrderController.getAllServiceOrders);
router.patch('/admin/:id/status', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), serviceOrderController.updateServiceOrderStatus);
router.patch('/admin/:id/tracking', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), serviceOrderController.updateTrackingNumber);
router.delete('/admin/:id',      authenticate, authorize('ADMIN', 'SUPER_ADMIN'), serviceOrderController.deleteServiceOrder);

module.exports = router;
