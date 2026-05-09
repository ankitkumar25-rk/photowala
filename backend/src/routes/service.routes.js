const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { upload, uploadToCloudinary } = require('../middleware/upload');
const { serviceRateLimiter } = require('../middleware/rateLimiter');
const serviceController = require('../controllers/service.controller');
const v = require('../validators/service.validator');

// --------------------------------------------------------------------
// CUSTOM PRINTING ROUTES
// --------------------------------------------------------------------

/**
 * All routes are protected by PASETO auth (CUSTOMER role)
 * Rate limited to 10 requests per minute
 */

router.post('/custom-printing/pen',
  authenticate,
  serviceRateLimiter,
  upload.single('design'),
  validate(v.penOrderSchema),
  uploadToCloudinary('photowala/custom-printing/pen'),
  serviceController.createCustomPrintingOrder('PEN')
);

router.post('/custom-printing/sticker-labels',
  authenticate,
  serviceRateLimiter,
  upload.single('design'),
  validate(v.stickerOrderSchema),
  uploadToCloudinary('photowala/custom-printing/sticker'),
  serviceController.createCustomPrintingOrder('STICKER')
);

router.post('/custom-printing/digital-printing',
  authenticate,
  serviceRateLimiter,
  upload.single('design'),
  validate(v.digitalPrintingSchema),
  uploadToCloudinary('photowala/custom-printing/digital'),
  serviceController.createCustomPrintingOrder('DIGITAL_PRINTING')
);

router.post('/custom-printing/letterhead',
  authenticate,
  serviceRateLimiter,
  upload.single('design'),
  validate(v.letterheadSchema),
  uploadToCloudinary('photowala/custom-printing/letterhead'),
  serviceController.createCustomPrintingOrder('LETTERHEAD')
);

router.post('/custom-printing/garment-tag',
  authenticate,
  serviceRateLimiter,
  upload.single('design'),
  validate(v.garmentTagSchema),
  uploadToCloudinary('photowala/custom-printing/garment'),
  serviceController.createCustomPrintingOrder('GARMENT_TAG')
);

router.post('/custom-printing/bill-book',
  authenticate,
  serviceRateLimiter,
  upload.single('design'),
  validate(v.billBookSchema),
  uploadToCloudinary('photowala/custom-printing/billbook'),
  serviceController.createCustomPrintingOrder('BILL_BOOK')
);

router.post('/custom-printing/envelope',
  authenticate,
  serviceRateLimiter,
  upload.single('design'),
  validate(v.envelopeSchema),
  uploadToCloudinary('photowala/custom-printing/envelope'),
  serviceController.createCustomPrintingOrder('ENVELOPE')
);

// --------------------------------------------------------------------
// MACHINE SERVICES ROUTES (QUOTATIONS)
// --------------------------------------------------------------------

router.post('/machine-services/co2-laser',
  authenticate,
  serviceRateLimiter,
  upload.single('file'),
  validate(v.co2LaserSchema),
  uploadToCloudinary('photowala/machine-services/co2'),
  serviceController.createMachineServiceRequest('CO2_LASER')
);

router.post('/machine-services/cnc-router',
  authenticate,
  serviceRateLimiter,
  upload.single('cadFile'),
  validate(v.cncRouterSchema),
  uploadToCloudinary('photowala/machine-services/cnc'),
  serviceController.createMachineServiceRequest('CNC_ROUTER')
);

router.post('/machine-services/laser-marking',
  authenticate,
  serviceRateLimiter,
  upload.single('artworkFile'),
  validate(v.laserMarkingSchema),
  uploadToCloudinary('photowala/machine-services/marking'),
  serviceController.createMachineServiceRequest('LASER_MARKING')
);

// --------------------------------------------------------------------
// ADMIN ROUTES (SUPER_ADMIN ONLY)
// --------------------------------------------------------------------

router.get('/admin/custom-printing',
  authenticate,
  authorize('SUPER_ADMIN'),
  serviceController.getAllCustomPrintingOrders
);

router.patch('/admin/custom-printing/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  serviceController.updateCustomPrintingStatus
);

router.get('/admin/machine-requests',
  authenticate,
  authorize('SUPER_ADMIN'),
  serviceController.getAllMachineServiceRequests
);

router.patch('/admin/machine-requests/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  serviceController.updateMachineServiceQuote
);

module.exports = router;
