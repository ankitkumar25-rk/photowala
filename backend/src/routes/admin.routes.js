import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as adminController from '../controllers/admin.controller.js';

const router = express.Router();

const isAdmin = authorize('ADMIN', 'SUPER_ADMIN');

// All admin routes require ADMIN or SUPER_ADMIN role
router.use(authenticate, isAdmin);

// Dashboard
router.get('/dashboard/stats',    adminController.getDashboardStats);
router.get('/dashboard/sales',    adminController.getSalesChart);

// Customers
router.get('/customers',          adminController.listCustomers);
router.get('/customers/:id',      adminController.getCustomer);
router.patch('/customers/:id/ban', adminController.banCustomer);

// Inventory
router.get('/inventory',          adminController.getInventory);
router.get('/inventory/low-stock', adminController.getLowStockProducts);

export default router;
