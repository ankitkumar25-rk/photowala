const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const returnsController = require('../controllers/returns.controller');

// Customer routes
router.post('/',      authenticate, returnsController.requestReturn);
router.get('/my',     authenticate, returnsController.getMyReturns);

// Admin routes
router.get('/admin',           authenticate, authorize('ADMIN', 'SUPER_ADMIN'), returnsController.getReturnsQueue);
router.patch('/:id/approve',   authenticate, authorize('ADMIN', 'SUPER_ADMIN'), returnsController.approveReturn);
router.patch('/:id/reject',    authenticate, authorize('ADMIN', 'SUPER_ADMIN'), returnsController.rejectReturn);

module.exports = router;
