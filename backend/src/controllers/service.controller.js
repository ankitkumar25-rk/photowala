const prisma = require('../config/database');
const { calculateServicePrice, pricingLogic } = require('../utils/pricing');
const { createError } = require('../middleware/errorHandler');
const { v4: uuidv4 } = require('uuid');
const { sendEmail, emailTemplates } = require('../config/email');
const ADMIN_EMAIL = 'photowalagift@gmail.com';

/**
 * Generate unique order/request numbers
 */
const generateNumber = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// --- Custom Printing Controller ---

exports.createCustomPrintingOrder = (serviceType) => async (req, res, next) => {
  try {
    const { orderName, quantity, deliveryOption, fileOption, specialRemark, ...details } = req.body;
    const userId = req.user.id;

    // 1. Calculate Base Price
    let baseAmount = 0;
    switch (serviceType) {
      case 'PEN': baseAmount = pricingLogic.PEN(quantity, details.penType); break;
      case 'STICKER': baseAmount = pricingLogic.STICKER(quantity, details.lamination); break;
      case 'LETTERHEAD': baseAmount = pricingLogic.LETTERHEAD(quantity, details.productCode); break;
      case 'GARMENT_TAG': baseAmount = pricingLogic.GARMENT_TAG(quantity, details.tagType, details.size, details.uvOption); break;
      case 'BILL_BOOK': baseAmount = pricingLogic.BILL_BOOK(quantity, details.bookType); break;
      case 'ENVELOPE': baseAmount = pricingLogic.ENVELOPE(quantity, details.paperType); break;
      case 'DIGITAL_PRINTING': baseAmount = 500; // Placeholder for digital printing logic
        break;
      default: baseAmount = 0;
    }

    // 2. Final Pricing
    const pricing = calculateServicePrice(baseAmount, fileOption);

    // 3. Create Order in DB
    const order = await prisma.customPrintingOrder.create({
      data: {
        orderNumber: generateNumber('CP'),
        userId,
        serviceType,
        orderName,
        quantity,
        deliveryOption,
        fileOption,
        specialRemark,
        details, // stored as JSON
        ...pricing,
        files: req.file?.cloudinary ? {
          create: {
            url: req.file.cloudinary.secure_url,
            publicId: req.file.cloudinary.public_id,
            fileName: req.file.originalname,
            fileType: req.file.mimetype
          }
        } : undefined
      },
      include: { files: true, user: { select: { name: true, email: true } } }
    });

    // 4. Notify Admin
    sendEmail({
      to: ADMIN_EMAIL,
      ...emailTemplates.adminNewCustomPrintingOrder(order, order.user)
    }).catch(err => console.error('Admin notification failed:', err));

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        gstAmount: order.gstAmount,
        estimatedDelivery: '5-7 Working Days'
      }
    });
  } catch (error) {
    next(error);
  }
};

// --- Machine Services Controller ---

exports.createMachineServiceRequest = (serviceType) => async (req, res, next) => {
  try {
    const { quantity, specialInstructions, ...specs } = req.body;
    const userId = req.user.id;

    const request = await prisma.machineServiceRequest.create({
      data: {
        requestNumber: generateNumber('MS'),
        userId,
        serviceType,
        orderName: specs.orderName || null,
        projectTitle: specs.projectTitle || null,
        quantity,
        specs, // stored as JSON
        files: req.file?.cloudinary ? {
          create: {
            url: req.file.cloudinary.secure_url,
            publicId: req.file.cloudinary.public_id,
            fileName: req.file.originalname,
            fileType: req.file.mimetype
          }
        } : undefined
      },
      include: { files: true, user: { select: { name: true, email: true } } }
    });

    // Notify Admin
    sendEmail({
      to: ADMIN_EMAIL,
      ...emailTemplates.adminNewServiceRequest(request, request.user)
    }).catch(err => console.error('Admin notification failed:', err));

    res.status(201).json({
      success: true,
      message: 'Quotation request submitted successfully',
      data: {
        requestId: request.id,
        requestNumber: request.requestNumber,
        status: 'PENDING_QUOTE'
      }
    });
  } catch (error) {
    next(error);
  }
};

// --- Admin Controllers ---

exports.getAllCustomPrintingOrders = async (req, res, next) => {
  try {
    const { serviceType, status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (serviceType) where.serviceType = serviceType;
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.customPrintingOrder.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        include: { user: { select: { name: true, email: true } }, files: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customPrintingOrder.count({ where })
    ]);

    res.json({ success: true, data: orders, pagination: { total, page, limit } });
  } catch (error) {
    next(error);
  }
};

exports.updateCustomPrintingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const order = await prisma.customPrintingOrder.update({
      where: { id },
      data: { status, adminNotes }
    });

    res.json({ success: true, message: 'Order updated successfully', data: order });
  } catch (error) {
    next(error);
  }
};

exports.getAllMachineServiceRequests = async (req, res, next) => {
    try {
      const { serviceType, status, page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;
  
      const where = {};
      if (serviceType) where.serviceType = serviceType;
      if (status) where.status = status;
  
      const [requests, total] = await Promise.all([
        prisma.machineServiceRequest.findMany({
          where,
          skip: Number(skip),
          take: Number(limit),
          include: { user: { select: { name: true, email: true } }, files: true },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.machineServiceRequest.count({ where })
      ]);
  
      res.json({ success: true, data: requests, pagination: { total, page, limit } });
    } catch (error) {
      next(error);
    }
  };

  exports.updateMachineServiceQuote = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { quotedPrice, adminNotes, status } = req.body;
  
      const request = await prisma.machineServiceRequest.update({
        where: { id },
        data: { 
            quotedPrice: quotedPrice ? Number(quotedPrice) : undefined, 
            adminNotes, 
            status 
        }
      });
  
      res.json({ success: true, message: 'Request updated successfully', data: request });
    } catch (error) {
      next(error);
    }
  };
