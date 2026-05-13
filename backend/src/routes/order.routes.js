import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as orderController from '../controllers/order.controller.js';

const router = express.Router();

const isAdmin = authorize('ADMIN', 'SUPER_ADMIN');

// Customer routes
router.post('/',            authenticate, orderController.createOrder);
router.get('/',             authenticate, orderController.getUserOrders);
router.post('/pen/laser',   authenticate, orderController.createLaserPenOrder);

// Admin routes
router.get('/admin/all',        authenticate, isAdmin, orderController.getAllOrders);
router.patch('/:id/status',     authenticate, isAdmin, orderController.updateOrderStatus);
router.patch('/:id/tracking',   authenticate, isAdmin, orderController.updateTracking);

router.get('/:id',          authenticate, orderController.getOrder);
router.post('/:id/cancel',  authenticate, orderController.cancelOrder);

export default router;
