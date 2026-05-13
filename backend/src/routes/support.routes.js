import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as supportController from '../controllers/support.controller.js';

const router = express.Router();

// Customer routes
router.post('/tickets',  authenticate, supportController.createTicket);
router.get('/tickets',   authenticate, supportController.getMyTickets);

// Admin routes
router.get('/admin/tickets',        authenticate, authorize('ADMIN', 'SUPER_ADMIN'), supportController.getTicketsQueue);
router.patch('/admin/tickets/:id',  authenticate, authorize('ADMIN', 'SUPER_ADMIN'), supportController.updateTicket);
router.patch('/admin/tickets/:id/close', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), supportController.closeTicket);

export default router;
