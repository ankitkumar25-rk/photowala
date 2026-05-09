const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { handleUpload } = require('../middleware/upload');
const { validate } = require('../middleware/validator');
const serviceController = require('../controllers/service.controller');
const v = require('../validators/customPrinting.validators');
const mv = require('../validators/machineService.validators');

// Rate limiting (assumed existing or standard)
const { rateLimiter } = require('../middleware/rateLimiter');

// All routes are under /api/v1/orders/custom-printing/
// Protected by PASETO auth

router.post('/pen', 
    authenticate, 
    rateLimiter, 
    handleUpload('designFile'), 
    validate(v.penSchema), 
    serviceController.createPenOrder
);

router.post('/sticker-labels', 
    authenticate, 
    rateLimiter, 
    handleUpload('designFile'), 
    validate(v.stickerSchema), 
    serviceController.createStickerOrder
);

router.post('/digital-printing', 
    authenticate, 
    rateLimiter, 
    handleUpload('designFile'), 
    validate(v.digitalPrintingSchema), 
    serviceController.createDigitalPrintingOrder
);

router.post('/letterhead', 
    authenticate, 
    rateLimiter, 
    handleUpload('designFile'), 
    validate(v.letterheadSchema), 
    serviceController.createLetterheadOrder
);

router.post('/garment-tag', 
    authenticate, 
    rateLimiter, 
    handleUpload('designFile'), 
    validate(v.garmentTagSchema), 
    serviceController.createGarmentTagOrder
);

router.post('/bill-book', 
    authenticate, 
    rateLimiter, 
    handleUpload('designFile'), 
    validate(v.billBookSchema), 
    serviceController.createBillBookOrder
);

router.post('/envelope', 
    authenticate, 
    rateLimiter, 
    handleUpload('designFile'), 
    validate(v.envelopeSchema), 
    serviceController.createEnvelopeOrder
);

// Public Tracking
router.get('/tracking/:orderNumber', serviceController.getOrderTracking);

// Machine Service Requests
router.post('/machine-requests', 
    authenticate, 
    validate(mv.machineRequestSchema), 
    serviceController.createMachineRequest
);

// User's Orders
router.get('/my-orders', authenticate, serviceController.getUserOrders);
router.get('/my-all-services', authenticate, serviceController.getMyServiceOrders);

// Admin Routes (Custom Printing)
router.get('/admin/custom-printing', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), serviceController.getAdminCustomPrintingOrders);
router.patch('/admin/custom-printing/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), serviceController.updateCustomPrintingStatus);

// Admin Routes (Machine Requests)
router.get('/admin/machine-requests', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), serviceController.getAdminMachineRequests);
router.patch('/admin/machine-requests/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), serviceController.updateMachineRequest);

// Cancel Order
router.patch('/:orderId/cancel', authenticate, serviceController.cancelOrder);

module.exports = router;
