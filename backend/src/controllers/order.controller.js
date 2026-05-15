import prisma from '../lib/prisma.js';
import { broadcastToAdmins } from '../services/notificationService.js';

import { createError } from '../middleware/errorHandler.js';
import { z } from 'zod';
import { sendEmail, emailTemplates } from '../config/email.js';
import asyncHandler from '../utils/asyncHandler.js';

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORG-${ts}-${rand}`;
}

function generatePenOrderId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PWG-${ts}-${rand}`;
}

const laserPenOrderSchema = z.object({
  orderName: z.string().min(3).max(120),
  penType: z.string().min(1).max(20),
  qty: z.coerce.number().int().positive(),
  deliveryOption: z.enum(['courier']),
  fileOption: z.enum(['attach', 'email']),
  emailForFile: z.string().email().optional(),
  specialRemark: z.string().max(300).optional(),
  pricing: z.object({
    applicableCost: z.coerce.number().nonnegative(),
    discountPercent: z.coerce.number().min(0).max(100),
    discountAmt: z.coerce.number().nonnegative(),
    emailCharge: z.coerce.number().nonnegative(),
    gst: z.coerce.number().nonnegative(),
    totalPayable: z.coerce.number().nonnegative(),
  }),
});

export const createOrder = asyncHandler(async (req, res) => {
  const { addressId, notes } = z.object({
    addressId: z.string().uuid(),
    notes: z.string().optional(),
  }).parse(req.body);

  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: req.user.id },
    select: { id: true },
  });
  if (!address) throw createError('Invalid delivery address', 400);

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

  let subtotal = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const { product } = item;
    if (!product.isActive) throw createError(`${product.name} is no longer available`, 400);

    const itemTotal = Number(product.price) * item.quantity;
    subtotal += itemTotal;
    orderItems.push({
      productId: product.id,
      quantity: item.quantity,
      price: product.price,
      total: itemTotal,
      productName: product.name,
      productUnit: product.unit,
      customizationText: item.customizationText || null,
      customizationImageUrl: item.customizationImageUrl || null,
    });
  }

  const shippingCost = subtotal >= 1000 ? 0 : 49;
  const total = subtotal + shippingCost;

  const order = await prisma.$transaction(async (tx) => {
    for (const item of cart.items) {
      const currentProduct = await tx.product.findUnique({
        where: { id: item.productId },
        select: { stock: true, name: true },
      });
      if (currentProduct.stock < item.quantity) {
        throw createError(`Insufficient stock for ${currentProduct.name}`, 400);
      }
    }

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
        addressId: address.id,
        subtotal,
        shippingCost,
        total,
        notes,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    return newOrder;
  });

  // Broadcast to admins
  broadcastToAdmins('new_order', {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: req.user?.name || 'Customer',
    customerEmail: req.user?.email,
    amount: order.total,
    itemCount: order.items?.length || 0,
    createdAt: order.createdAt,
    type: 'ORDER',
  });

  const user = { name: req.user.name || 'Customer', email: req.user.email };
  const tpl = emailTemplates.orderConfirmation(order, user);
  const adminTpl = emailTemplates.adminNewOrder(order, user);
  sendEmail({ to: process.env.EMAIL_FROM, ...adminTpl }).catch(console.error);

  res.status(201).json({ success: true, data: order });
});

export const getUserOrders = asyncHandler(async (req, res) => {
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
      },
    }),
    prisma.order.count({ where: { userId: req.user.id } }),
  ]);

  res.json({ success: true, data: orders, meta: { total, page: Number(page) } });
});

export const getOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Try finding by ID (UUID) first
  let order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { include: { images: { take: 1 } } } } },
      address: true,
    },
  });

  // If not found by ID, try finding by orderNumber
  if (!order) {
    order = await prisma.order.findUnique({
      where: { orderNumber: id },
      include: {
        items: { include: { product: { include: { images: { take: 1 } } } } },
        address: true,
      },
    });
  }
  if (!order) throw createError('Order not found', 404);
  if (order.userId !== req.user.id && req.user.role === 'CUSTOMER') throw createError('Forbidden', 403);
  res.json({ success: true, data: order });
});

export const cancelOrder = asyncHandler(async (req, res) => {
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
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const pageNum = Math.max(1, parseInt(req.query.page) || 1);
  const limitNum = Math.max(1, parseInt(req.query.limit) || 20);
  const { status } = req.query;
  
  const where = status ? { status } : {};
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: { 
        user: { select: { name: true, email: true } }, 
      },
    }),
    prisma.order.count({ where }),
  ]);

  res.json({ 
    success: true, 
    data: orders || [], 
    meta: { 
      total: total || 0, 
      page: pageNum,
      limit: limitNum
    } 
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber } = z.object({ 
    status: z.enum(['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED']),
    trackingNumber: z.string().nullable().optional(),
  }).parse(req.body);

  const updateData = { status };
  if (trackingNumber !== undefined) {
    updateData.trackingNumber = trackingNumber;
  }

  const order = await prisma.order.update({ 
    where: { id: req.params.id }, 
    data: updateData 
  });
  res.json({ success: true, data: order });
});

export const updateTracking = asyncHandler(async (req, res) => {
  const { trackingNumber } = z.object({ trackingNumber: z.string().min(1) }).parse(req.body);
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { trackingNumber, status: 'SHIPPED' },
  });
  res.json({ success: true, data: order });
});

export const createLaserPenOrder = asyncHandler(async (req, res) => {
  const payload = laserPenOrderSchema.parse(req.body);
  if (payload.fileOption === 'email' && !payload.emailForFile) {
    throw createError('Email is required when file option is email', 422);
  }
  if (payload.fileOption === 'attach' && payload.emailForFile) {
    throw createError('Do not provide email for attach file option', 422);
  }

  const orderId = generatePenOrderId();
  res.status(201).json({ success: true, orderId });
});
