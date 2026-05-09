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

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

/**
 * Get service orders for the logged-in user
 */
exports.getMyServiceOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      prisma.serviceOrder.findMany({
        where: { userId: req.user.id },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.serviceOrder.count({ where: { userId: req.user.id } })
    ]);

    res.json({ success: true, data: orders, meta: { total, page: Number(page) } });
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
    const { category, status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (category) where.category = category;
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.serviceOrder.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } }
      }),
      prisma.serviceOrder.count({ where })
    ]);

    res.json({ success: true, data: orders, meta: { total, page: Number(page) } });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Update service order status
 */
exports.updateServiceOrderStatus = async (req, res, next) => {
  try {
    const { status } = z.object({ 
      status: z.enum(['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED']) 
    }).parse(req.body);

    const order = await prisma.serviceOrder.update({
      where: { id: req.params.id },
      data: { status }
    });

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
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
