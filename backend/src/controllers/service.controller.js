const prisma = require('../config/database');
const pricingUtil = require('../utils/pricing');
const { sendEmail } = require('../config/email');
const { createError } = require('../middleware/errorHandler');

const ADMIN_EMAIL = 'photowalagift@gmail.com';

const generateOrderNumber = (prefix) => {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${year}-${random}`;
};

/**
 * Shared logic to create any custom printing order
 */
const createOrder = (serviceType, pricingFunc) => async (req, res, next) => {
    try {
        const userId = req.user.id;
        const data = req.body;
        
        // 1. Calculate pricing
        const priceBreakdown = pricingFunc(data);
        const estimatedDelivery = pricingUtil.getEstimatedDelivery(serviceType, data.product || data.penType);

        // 2. Prepare order data
        const orderData = {
            orderNumber: generateOrderNumber('CP'),
            userId,
            serviceType,
            orderName: data.orderName,
            ...priceBreakdown,
            fileSubmission: data.fileSubmission,
            deliveryOption: data.deliveryOption,
            paymentMethod: data.paymentMethod,
            serviceData: data,
            estimatedDelivery,
            status: 'PENDING',
            paymentStatus: 'PENDING'
        };

        // 3. Save to DB
        const order = await prisma.customPrintingOrder.create({
            data: orderData
        });

        // 4. Save file record if uploaded
        if (req.file) {
            await prisma.orderFile.create({
                data: {
                    orderId: order.id,
                    fileName: req.file.filename,
                    originalName: req.file.originalname,
                    mimeType: req.file.mimetype,
                    size: req.file.size,
                    localPath: `uploads/${serviceType.toLowerCase()}/${req.file.filename}`
                }
            });
        }

        // 5. Send notification email to admin
        const emailContent = `
            <h2>New ${serviceType} Order: #${order.orderNumber}</h2>
            <p><strong>Customer ID:</strong> ${userId}</p>
            <p><strong>Order Name:</strong> ${order.orderName}</p>
            <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
            <p><strong>File Submission:</strong> ${order.fileSubmission}</p>
            <p><strong>Service Data:</strong> ${JSON.stringify(data, null, 2)}</p>
            ${req.file ? `<p><strong>File Path:</strong> ${req.file.path}</p>` : ''}
        `;

        await sendEmail({
            to: ADMIN_EMAIL,
            subject: `🚨 New Print Order - ${order.orderNumber}`,
            html: emailContent
        }).catch(err => console.error('Email failed:', err));

        // 6. Response
        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                serviceType: order.serviceType,
                totalAmount: order.totalAmount,
                gstAmount: order.gstAmount,
                status: order.status,
                estimatedDelivery: order.estimatedDelivery,
                paymentMethod: order.paymentMethod,
                emailInstruction: order.fileSubmission === 'EMAIL' 
                    ? 'Please send your design file to photowalagift@gmail.com with your order number in the subject.' 
                    : null
            }
        });

    } catch (error) {
        next(error);
    }
};

// Specific handlers
exports.createPenOrder = createOrder('PEN', pricingUtil.calcPenPrice);
exports.createStickerOrder = createOrder('STICKER_LABELS', pricingUtil.calcStickerPrice);
exports.createDigitalPrintingOrder = createOrder('DIGITAL_PRINTING', pricingUtil.calcDigitalPrintingPrice);
exports.createLetterheadOrder = createOrder('LETTERHEAD', pricingUtil.calcLetterheadPrice);
exports.createGarmentTagOrder = createOrder('GARMENT_TAG', pricingUtil.calcGarmentTagPrice);
exports.createBillBookOrder = createOrder('BILL_BOOK', pricingUtil.calcBillBookPrice);
exports.createEnvelopeOrder = createOrder('ENVELOPE', pricingUtil.calcEnvelopePrice);

/**
 * Public Tracking
 */
exports.getOrderTracking = async (req, res, next) => {
    try {
        const { orderNumber } = req.params;
        const order = await prisma.customPrintingOrder.findUnique({
            where: { orderNumber },
            include: { files: true }
        });

        if (!order) return next(createError('Order not found', 404));

        res.json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};

/**
 * User's Orders
 */
exports.getUserOrders = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            prisma.customPrintingOrder.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.customPrintingOrder.count({ where: { userId } })
        ]);

        res.json({
            success: true,
            data: orders,
            pagination: { total, page, limit }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cancel Order
 */
exports.cancelOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await prisma.customPrintingOrder.findFirst({
            where: { id: orderId, userId }
        });

        if (!order) return next(createError('Order not found', 404));
        if (order.status !== 'PENDING') return next(createError('Only pending orders can be cancelled', 400));

        await prisma.customPrintingOrder.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' }
        });

        res.json({ success: true, message: 'Order cancelled successfully' });
    } catch (error) {
        next(error);
    }
};
/**
 * Machine Service Requests
 */
exports.createMachineRequest = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { serviceType, orderName, serviceData } = req.body;

        const requestNumber = generateOrderNumber('MS');
        
        const request = await prisma.machineServiceRequest.create({
            data: {
                requestNumber,
                userId,
                serviceType,
                orderName,
                serviceData,
                status: 'PENDING_QUOTE'
            }
        });

        // Notify Admin
        await sendEmail({
            to: ADMIN_EMAIL,
            subject: `🛠️ New Machine Service Request - ${requestNumber}`,
            html: `
                <h2>New Machine Request: ${serviceType}</h2>
                <p><strong>Request #:</strong> ${requestNumber}</p>
                <p><strong>Customer ID:</strong> ${userId}</p>
                <p><strong>Details:</strong> ${JSON.stringify(serviceData, null, 2)}</p>
            `
        }).catch(err => console.error('Admin email failed:', err));

        res.status(201).json({
            success: true,
            message: 'Request submitted successfully. We will provide a quote soon.',
            request
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Custom Printing Orders
 */
exports.getAdminCustomPrintingOrders = async (req, res, next) => {
    try {
        const { page = 1, status, serviceType, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const where = {};
        if (status) where.status = status;
        if (serviceType) where.serviceType = serviceType;

        const [orders, total] = await Promise.all([
            prisma.customPrintingOrder.findMany({
                where,
                include: { 
                    user: { select: { name: true, email: true, phone: true } },
                    files: true
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.customPrintingOrder.count({ where })
        ]);

        res.json({
            success: true,
            data: orders,
            pagination: { total, page: parseInt(page), limit: parseInt(limit) }
        });
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
            data: { status, adminNotes },
            include: { user: { select: { email: true, name: true } } }
        });

        // Notify user of status change
        await sendEmail({
            to: order.user.email,
            subject: `Update on your Order #${order.orderNumber}`,
            html: `<p>Hi ${order.user.name}, your order status has been updated to <strong>${status}</strong>.</p>`
        }).catch(err => console.error('Status update email failed:', err));

        res.json({ success: true, message: 'Order updated', order });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Machine Service Requests
 */
exports.getAdminMachineRequests = async (req, res, next) => {
    try {
        const { page = 1, status, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const where = {};
        if (status) where.status = status;

        const [requests, total] = await Promise.all([
            prisma.machineServiceRequest.findMany({
                where,
                include: { user: { select: { name: true, email: true, phone: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.machineServiceRequest.count({ where })
        ]);

        res.json({
            success: true,
            data: requests,
            pagination: { total, page: parseInt(page), limit: parseInt(limit) }
        });
    } catch (error) {
        next(error);
    }
};

exports.updateMachineRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, quotedPrice, adminNotes } = req.body;

        const request = await prisma.machineServiceRequest.update({
            where: { id },
            data: { status, quotedPrice, adminNotes },
            include: { user: { select: { email: true, name: true } } }
        });

        // Notify user
        if (status === 'QUOTE_SENT') {
            await sendEmail({
                to: request.user.email,
                subject: `Quote for Request #${request.requestNumber}`,
                html: `<p>Hi ${request.user.name}, we have sent a quote of <strong>₹${quotedPrice}</strong> for your request.</p>`
            }).catch(err => console.error('Quote email failed:', err));
        }

        res.json({ success: true, message: 'Request updated', request });
    } catch (error) {
        next(error);
    }
};

/**
 * Combined "My Services" for users
 */
exports.getMyServiceOrders = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        const [printOrders, machineRequests] = await Promise.all([
            prisma.customPrintingOrder.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.machineServiceRequest.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        res.json({
            success: true,
            data: {
                printOrders,
                machineRequests
            }
        });
    } catch (error) {
        next(error);
    }
};
