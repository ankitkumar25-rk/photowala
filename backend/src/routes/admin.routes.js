const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const adminController = require('../controllers/admin.controller');

// All admin routes require ADMIN or SUPER_ADMIN role
router.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));

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



module.exports = router;
