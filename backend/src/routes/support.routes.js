const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const supportController = require('../controllers/support.controller');

// Customer routes
router.post('/tickets',  authenticate, supportController.createTicket);
router.get('/tickets',   authenticate, supportController.getMyTickets);

// Admin routes
router.get('/admin/tickets',        authenticate, authorize('ADMIN', 'SUPER_ADMIN'), supportController.getTicketsQueue);
router.patch('/admin/tickets/:id',  authenticate, authorize('ADMIN', 'SUPER_ADMIN'), supportController.updateTicket);
router.patch('/admin/tickets/:id/close', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), supportController.closeTicket);

module.exports = router;
