const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const serviceOrderController = require('../controllers/serviceOrder.controller');

// Customer routes
router.post('/',                authenticate, serviceOrderController.createServiceOrder);
router.get('/my',               authenticate, serviceOrderController.getMyServiceOrders);
router.get('/:id',              authenticate, serviceOrderController.getServiceOrderDetail);

// Admin routes
router.get('/admin/all',        authenticate, isAdmin, serviceOrderController.getAllServiceOrders);
router.patch('/admin/:id/status', authenticate, isAdmin, serviceOrderController.updateServiceOrderStatus);
router.patch('/admin/:id/tracking', authenticate, isAdmin, serviceOrderController.updateTrackingNumber);
router.delete('/admin/:id',      authenticate, isAdmin, serviceOrderController.deleteServiceOrder);

module.exports = router;
