const prisma = require('../../../config/database');
const priceService = require('../services/price.service');
const fileService = require('../services/file.service');
const crypto = require('crypto');

function generateOrderNumber() {
  return 'PP-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

exports.createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { orderName, productId, penTypeId, quantity, deliveryMethod, courierId } = req.body;

    const priceDetails = await priceService.calculateApplicablePrice(productId, quantity);
    const orderNumber = generateOrderNumber();

    let initialStatus = 'PENDING';
    if (parseFloat(priceDetails.totalAmount) === 0) {
      initialStatus = 'PROCESSING'; // Skip payment for free items
    }

    const order = await prisma.printedPenOrder.create({
      data: {
        orderNumber,
        userId,
        orderName,
        productId,
        penTypeId,
        quantity,
        deliveryMethod,
        courierId: courierId || null,
        baseCost: priceDetails.baseCost,
        discountAmount: priceDetails.discountAmount,
        applicableCost: priceDetails.applicableCost,
        gstAmount: priceDetails.gstAmount,
        totalAmount: priceDetails.totalAmount,
        status: initialStatus
      }
    });

    await prisma.printedPenOrderActivityLog.create({
      data: {
        orderId: order.id,
        action: 'ORDER_CREATED',
        description: 'Order placed successfully',
        statusTo: initialStatus,
        userId
      }
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

exports.uploadFile = async (req, res, next) => {
  try {
    const { order_id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const order = await prisma.printedPenOrder.findUnique({ where: { id: order_id } });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const fileDetails = await fileService.uploadOrderFile(order_id, file.buffer, file.originalname);

    let nextStatus = order.status;
    if (order.status === 'PENDING') {
      nextStatus = parseFloat(order.totalAmount) > 0 ? 'PAYMENT_PENDING' : 'PROCESSING';
    }

    const updatedOrder = await prisma.printedPenOrder.update({
      where: { id: order_id },
      data: {
        fileUrl: fileDetails.fileUrl,
        filePublicId: fileDetails.filePublicId,
        originalFileName: file.originalname,
        fileType: fileDetails.fileType,
        fileSize: fileDetails.fileSize,
        status: nextStatus
      }
    });

    await prisma.printedPenOrderActivityLog.create({
      data: {
        orderId: order.id,
        action: 'FILE_UPLOADED',
        description: `Design file ${file.originalname} uploaded`,
        statusFrom: order.status,
        statusTo: nextStatus,
        userId: req.user.id
      }
    });

    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

exports.trackOrder = async (req, res, next) => {
  try {
    const { order_id } = req.params;
    const order = await prisma.printedPenOrder.findUnique({
      where: { id: order_id },
      include: {
        activityLogs: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    next(error);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await prisma.printedPenOrder.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        product: true,
        penType: true
      }
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await prisma.printedPenOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } }, product: true }
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

exports.getNewOrders = async (req, res, next) => {
  try {
    const orders = await prisma.printedPenOrder.findMany({
      where: { isNew: true },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } }, product: true }
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

exports.getOrderDetails = async (req, res, next) => {
  try {
    const order = await prisma.printedPenOrder.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        product: true,
        penType: true,
        courier: true,
        activityLogs: { orderBy: { createdAt: 'desc' } }
      }
    });
    
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.isNew) {
      await prisma.printedPenOrder.update({
        where: { id: order.id },
        data: { isNew: false }
      });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, adminRemark } = req.body;
    const order = await prisma.printedPenOrder.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const updatedOrder = await prisma.printedPenOrder.update({
      where: { id: order.id },
      data: { status, adminRemark: adminRemark || order.adminRemark }
    });

    await prisma.printedPenOrderActivityLog.create({
      data: {
        orderId: order.id,
        action: 'STATUS_UPDATED',
        description: `Order status changed to ${status}`,
        statusFrom: order.status,
        statusTo: status,
        userId: req.user.id
      }
    });

    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

exports.markOrderViewed = async (req, res, next) => {
  try {
    const order = await prisma.printedPenOrder.update({
      where: { id: req.params.id },
      data: { isNew: false }
    });
    res.json(order);
  } catch (error) {
    next(error);
  }
};

exports.downloadFile = async (req, res, next) => {
  try {
    const order = await prisma.printedPenOrder.findUnique({ where: { id: req.params.id } });
    if (!order || !order.fileUrl) return res.status(404).json({ error: 'File not found' });
    
    res.json({ url: order.fileUrl, fileName: order.originalFileName });
  } catch (error) {
    next(error);
  }
};
