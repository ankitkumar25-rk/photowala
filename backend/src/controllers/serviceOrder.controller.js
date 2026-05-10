const prisma = require('../config/database');
const { createError } = require('../middleware/errorHandler');
const { z } = require('zod');

/**
 * Generate a unique order number based on category
 */
function generateServiceOrderNumber(category) {
  const prefix = category === 'MACHINE' ? 'MSC' : 'PRT';
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

/**
 * Create a new Service Order (Machine or Printing)
 */
exports.createServiceOrder = async (req, res, next) => {
  try {
    const { 
      category, 
      serviceName, 
      productName, 
      quantity, 
      totalAmount, 
      details, 
      fileUrl, 
      fileOption, 
      specialRemark, 
      customerName 
    } = req.body;

    // Basic validation
    if (!category || !serviceName || !quantity) {
      throw createError('Category, service name and quantity are required', 400);
    }

    const order = await prisma.serviceOrder.create({
      data: {
        orderNumber: generateServiceOrderNumber(category),
        userId: req.user.id,
        category,
        serviceName,
        productName,
        quantity: Number(quantity),
        totalAmount: Number(totalAmount || 0),
        details: details || {},
        fileUrl,
        fileOption,
        specialRemark,
        customerName
      }
    });

    res.status(201).json({ 
      success: true, 
      orderId: order.id,
      orderNumber: order.orderNumber,
      data: order 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get service orders for the logged-in user
 */
exports.getMyServiceOrders = async (req, res, next) => {
  try {
    const pageNum = Math.max(1, parseInt(req.query.page) || 1);
    const limitNum = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      prisma.serviceOrder.findMany({
        where: { userId: req.user.id },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.serviceOrder.count({ where: { userId: req.user.id } })
    ]);

    res.json({ success: true, data: orders, meta: { total, page: pageNum } });
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single service order detail
 */
exports.getServiceOrderDetail = async (req, res, next) => {
  try {
    const order = await prisma.serviceOrder.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { name: true, email: true, phone: true } } }
    });

    if (!order) throw createError('Service order not found', 404);
    
    // Authorization check
    if (req.user.role === 'CUSTOMER' && order.userId !== req.user.id) {
      throw createError('Forbidden', 403);
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Get all service orders (filtered by category)
 */
exports.getAllServiceOrders = async (req, res, next) => {
  try {
    const pageNum = Math.max(1, parseInt(req.query.page) || 1);
    const limitNum = Math.max(1, parseInt(req.query.limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (category) where.category = category;
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.serviceOrder.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } }
      }),
      prisma.serviceOrder.count({ where })
    ]);

    res.json({ success: true, data: orders, meta: { total, page: pageNum } });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Update service order status
 */
exports.updateServiceOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await prisma.serviceOrder.update({
      where: { id },
      data: { status }
    });
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
};

exports.updateTrackingNumber = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { trackingNumber } = req.body;
    const order = await prisma.serviceOrder.update({
      where: { id },
      data: { trackingNumber }
    });
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
};

/**
 * Admin: Delete service order
 */
exports.deleteServiceOrder = async (req, res, next) => {
  try {
    await prisma.serviceOrder.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Service order deleted' });
  } catch (err) {
    next(err);
  }
};
