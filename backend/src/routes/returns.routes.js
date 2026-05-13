import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as returnsController from '../controllers/returns.controller.js';

const router = express.Router();

// Customer routes
router.post('/',      authenticate, returnsController.requestReturn);
router.get('/my',     authenticate, returnsController.getMyReturns);

// Admin routes
router.get('/admin',           authenticate, authorize('ADMIN', 'SUPER_ADMIN'), returnsController.getReturnsQueue);
router.patch('/:id/approve',   authenticate, authorize('ADMIN', 'SUPER_ADMIN'), returnsController.approveReturn);
router.patch('/:id/reject',    authenticate, authorize('ADMIN', 'SUPER_ADMIN'), returnsController.rejectReturn);

export default router;
