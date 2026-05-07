const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const orderController = require('../controllers/order.controller');
const priceController = require('../controllers/price.controller');
const paymentController = require('../controllers/payment.controller');
const serviceRequestController = require('../controllers/serviceRequest.controller');

// Import your existing auth middlewares. Adjust paths if necessary.
const { authenticate, authorize } = require('../../../middleware/auth');
const authorizeAdmin = authorize('ADMIN', 'SUPER_ADMIN');
const fileUpload = require('../middleware/fileUpload.middleware');

// Public Routes
router.get('/products', productController.getProducts);
router.get('/pen-types', productController.getPenTypes);
router.get('/couriers', productController.getCouriers);

router.post('/price/calculate', priceController.calculatePrice);

router.post('/orders', orderController.createOrder);
router.post('/orders/:order_id/upload', fileUpload.single('file'), orderController.uploadFile);
router.get('/orders/track/:order_id', orderController.trackOrder);

router.post('/payment/initiate', paymentController.initiatePayment);

// Customer Routes
router.get('/my-orders', authenticate, orderController.getMyOrders);
router.get('/my-requests', authenticate, serviceRequestController.getMyRequests);
router.post('/service-request', authenticate, serviceRequestController.createServiceRequest);
router.get('/service-request/:id/track', authenticate, serviceRequestController.trackServiceRequest);

// Admin Routes
router.get('/admin/orders', authenticate, authorizeAdmin, orderController.getAllOrders);
router.get('/admin/orders/new', authenticate, authorizeAdmin, orderController.getNewOrders);
router.get('/admin/orders/:id', authenticate, authorizeAdmin, orderController.getOrderDetails);
router.put('/admin/orders/:id/status', authenticate, authorizeAdmin, orderController.updateOrderStatus);
router.put('/admin/orders/:id/mark-viewed', authenticate, authorizeAdmin, orderController.markOrderViewed);
router.get('/admin/orders/:id/download', authenticate, authorizeAdmin, orderController.downloadFile);

router.get('/admin/service-requests', authenticate, authorizeAdmin, serviceRequestController.getAllServiceRequests);
router.put('/admin/service-request/:id/status', authenticate, authorizeAdmin, serviceRequestController.updateServiceRequestStatus);

module.exports = router;
