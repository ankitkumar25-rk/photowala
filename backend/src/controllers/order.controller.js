const prisma = require('../config/database');
const { createError } = require('../middleware/errorHandler');
const { z } = require('zod');
const { sendEmail, emailTemplates } = require('../config/email');

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORG-${ts}-${rand}`;
}

exports.createOrder = async (req, res, next) => {
  try {
    const { addressId, notes } = z.object({
      addressId: z.string().uuid(),
      notes: z.string().optional(),
    }).parse(req.body);

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, price: true, stock: true, unit: true, isActive: true } },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) throw createError('Cart is empty', 400);

    // Check stock and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const { product } = item;
      if (!product.isActive) throw createError(`${product.name} is no longer available`, 400);
      if (product.stock < item.quantity) throw createError(`Insufficient stock for ${product.name}`, 400);

      const itemTotal = Number(product.price) * item.quantity;
      subtotal += itemTotal;
      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
        productName: product.name,
        productUnit: product.unit,
      });
    }

    const shippingCost = subtotal >= 1000 ? 0 : 49; // Free shipping above ₹999
    const total = subtotal + shippingCost;

    // Create order + decrement stock atomically
    const order = await prisma.$transaction(async (tx) => {
      // Decrement stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: req.user.id,
          addressId,
          subtotal,
          shippingCost,
          total,
          notes,
          items: { create: orderItems },
        },
        include: { items: true },
      });

      // Clear cart
      await tx.cart.update({
        where: { id: cart.id },
        data: { items: { deleteMany: {} } },
      });

      return newOrder;
    });

    // Send confirmation email
    const user = { name: req.user.name || 'Customer', email: req.user.email };
    const tpl = emailTemplates.orderConfirmation(order, user);
    sendEmail({ to: req.user.email, ...tpl }).catch(console.error);

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

exports.getUserOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: req.user.id },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: { product: { select: { name: true, images: { where: { isPrimary: true }, take: 1 } } } },
          },
          payment: { select: { status: true, method: true } },
        },
      }),
      prisma.order.count({ where: { userId: req.user.id } }),
    ]);

    res.json({ success: true, data: orders, meta: { total, page: Number(page) } });
  } catch (err) {
    next(err);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: { include: { product: { include: { images: { take: 1 } } } } },
        address: true,
        payment: true,
      },
    });
    if (!order) throw createError('Order not found', 404);
    if (order.userId !== req.user.id && req.user.role === 'CUSTOMER') throw createError('Forbidden', 403);
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) throw createError('Order not found', 404);
    if (order.userId !== req.user.id) throw createError('Forbidden', 403);
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      throw createError('Order cannot be cancelled at this stage', 400);
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' },
    });

    res.json({ success: true, message: 'Order cancelled' });
  } catch (err) {
    next(err);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } }, payment: true },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ success: true, data: orders, meta: { total, page: Number(page) } });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.enum(['CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED']) }).parse(req.body);
    const order = await prisma.order.update({ where: { id: req.params.id }, data: { status } });
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

exports.updateTracking = async (req, res, next) => {
  try {
    const { trackingNumber } = z.object({ trackingNumber: z.string().min(1) }).parse(req.body);
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { trackingNumber, status: 'SHIPPED' },
    });
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};
