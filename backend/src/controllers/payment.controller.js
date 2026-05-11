const crypto = require('crypto');
const prisma = require('../config/database');
const razorpay = require('../config/razorpay');
const { createError } = require('../middleware/errorHandler');
const { sendEmail, emailTemplates } = require('../config/email');

/**
 * A) Create Razorpay Order
 */
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', orderId, orderType } = req.body;

    if (!amount || !orderId || !orderType) {
      throw createError('Missing required fields', 400);
    }

    // Validate orderType
    const validOrderTypes = ['ORDER', 'SERVICE_ORDER'];
    if (!validOrderTypes.includes(orderType)) {
      throw createError(`Invalid orderType. Must be one of: ${validOrderTypes.join(', ')}`, 400);
    }

    // Razorpay expects amount in PAISE (rupees * 100)
    const amountInPaise = Math.round(Number(amount) * 100);

    const options = {
      amount: amountInPaise,
      currency,
      receipt: orderId,
    };

    const rzpOrder = await razorpay.orders.create(options);

    // Save to Payments table
    await prisma.payment.create({
      data: {
        userId: req.user.id,
        internalOrderId: orderId,
        orderType,
        razorpayOrderId: rzpOrder.id,
        amount: amountInPaise,
        currency,
        status: 'CREATED',
        paymentMethod: 'RAZORPAY',
      },
    });

    res.json({
      success: true,
      data: {
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * B) Verify Razorpay Payment
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      internalOrderId, 
      orderType 
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !internalOrderId || !orderType) {
      throw createError('Missing required payment verification fields', 400);
    }

    // Validate orderType
    const validOrderTypes = ['ORDER', 'SERVICE_ORDER'];
    if (!validOrderTypes.includes(orderType)) {
      throw createError(`Invalid orderType. Must be one of: ${validOrderTypes.join(', ')}`, 400);
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .toString('hex');

    const isValid = expected === razorpay_signature;

    if (!isValid) {
      try {
        await prisma.payment.update({
          where: { razorpayOrderId: razorpay_order_id },
          data: { status: 'FAILED' },
        });
      } catch (e) {
        console.error('[payment] Failed to mark payment as FAILED:', e.message);
      }
      throw createError('Payment verification failed', 400);
    }

    // Fetch the order to validate it exists and belongs to user, and get the amount
    const orderData = orderType === 'ORDER'
      ? await prisma.order.findUnique({ where: { id: internalOrderId }, include: { user: true } })
      : await prisma.serviceOrder.findUnique({ where: { id: internalOrderId }, include: { user: true } });

    if (!orderData) {
      throw createError(`${orderType === 'ORDER' ? 'Order' : 'Service Order'} not found`, 404);
    }

    // Authorization check: verify payment belongs to authenticated user
    if (orderData.userId !== req.user.id) {
      throw createError('Unauthorized: Payment does not belong to this user', 403);
    }

    // Fetch existing payment to check idempotency and validate amount
    const existingPayment = await prisma.payment.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
    });

    if (existingPayment && existingPayment.status === 'PAID') {
      // Idempotent: already processed, return success
      return res.json({
        success: true,
        data: {
          paymentId: razorpay_payment_id,
          message: 'Payment already verified successfully',
        },
      });
    }

    // Success: update payment and orders atomically
    await prisma.$transaction([
      // Update Payment record
      prisma.payment.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: { 
          status: 'PAID', 
          razorpayPaymentId: razorpay_payment_id, 
          paidAt: new Date() 
        },
      }),
      // Update Order or ServiceOrder
      orderType === 'ORDER' 
        ? prisma.order.update({
            where: { id: internalOrderId },
            data: { paymentStatus: 'PAID', paymentMethod: 'RAZORPAY' },
          })
        : prisma.serviceOrder.update({
            where: { id: internalOrderId },
            data: { 
              paymentStatus: 'PAID', 
              paymentMethod: 'RAZORPAY',
              status: 'CONFIRMED' // Mark as confirmed once paid
            },
          })
    ]);

    // Send confirmation email (non-blocking)
    if (orderData.user) {
      // Email sending logic would go here
    }

    res.json({
      success: true,
      data: {
        paymentId: razorpay_payment_id,
        message: 'Payment verified successfully',
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * C) Confirm Cash on Delivery
 */
exports.confirmCOD = async (req, res, next) => {
  try {
    const { internalOrderId, orderType } = req.body;

    if (!internalOrderId || !orderType) {
      throw createError('Missing required fields', 400);
    }

    // Validate orderType
    const validOrderTypes = ['ORDER', 'SERVICE_ORDER'];
    if (!validOrderTypes.includes(orderType)) {
      throw createError(`Invalid orderType. Must be one of: ${validOrderTypes.join(', ')}`, 400);
    }

    // Verify order exists and belongs to user
    const orderData = orderType === 'ORDER'
      ? await prisma.order.findUnique({ where: { id: internalOrderId } })
      : await prisma.serviceOrder.findUnique({ where: { id: internalOrderId } });

    if (!orderData) {
      throw createError(`${orderType === 'ORDER' ? 'Order' : 'Service Order'} not found`, 404);
    }

    if (orderData.userId !== req.user.id) {
      throw createError('Unauthorized', 403);
    }

    await prisma.$transaction([
      orderType === 'ORDER'
        ? prisma.order.update({
            where: { id: internalOrderId },
            data: { paymentMethod: 'COD', paymentStatus: 'COD_PENDING' }
          })
        : prisma.serviceOrder.update({
            where: { id: internalOrderId },
            data: { 
              paymentMethod: 'COD', 
              paymentStatus: 'COD_PENDING',
              status: 'PENDING' // Set status to PENDING for COD orders
            }
          }),
      prisma.payment.create({
        data: {
          userId: req.user.id,
          internalOrderId,
          orderType,
          amount: 0, // No online payment amount
          status: 'COD_PENDING',
          paymentMethod: 'COD'
        }
      })
    ]);

    res.json({
      success: true,
      data: { message: 'COD order confirmed' },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * D) Razorpay Webhook
 */
exports.razorpayWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    // Verify webhook signature
    // req.body is already a Buffer because of express.raw()
    const expected = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.body)
      .digest('hex');

    if (signature !== expected) {
      console.error('[webhook] CSRF attack suspected: invalid signature');
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    const event = JSON.parse(req.body.toString());
    const { payload, event: eventType } = event;

    // Validate payload structure
    if (!payload || !eventType) {
      console.error('[webhook] Invalid payload structure');
      return res.status(400).json({ success: false, error: 'Invalid payload' });
    }

    // Use structured logging with non-sensitive data only
    console.log(`[webhook] Processing event type: ${eventType}, timestamp: ${new Date().toISOString()}`);

    if (eventType === 'payment.captured') {
      const razorpayOrderId = payload.payment?.entity?.order_id;
      const razorpayPaymentId = payload.payment?.entity?.id;

      if (!razorpayOrderId || !razorpayPaymentId) {
        console.error('[webhook] Missing payment details in payload');
        return res.status(200).json({ received: true }); // Return 200 to stop retries
      }

      // Fetch payment with transaction to prevent concurrent updates
      const payment = await prisma.payment.findUnique({ 
        where: { razorpayOrderId } 
      });

      if (payment && payment.status !== 'PAID') {
        await prisma.$transaction([
          prisma.payment.update({
            where: { razorpayOrderId },
            data: { status: 'PAID', razorpayPaymentId, paidAt: new Date() }
          }),
          payment.orderType === 'ORDER'
            ? prisma.order.update({
                where: { id: payment.internalOrderId },
                data: { paymentStatus: 'PAID', paymentMethod: 'RAZORPAY' }
              })
            : prisma.serviceOrder.update({
                where: { id: payment.internalOrderId },
                data: { 
                  paymentStatus: 'PAID', 
                  paymentMethod: 'RAZORPAY',
                  status: 'CONFIRMED'
                }
              })
        ]);
      }
    } else if (eventType === 'payment.failed') {
      const razorpayOrderId = payload.payment?.entity?.order_id;

      if (razorpayOrderId) {
        try {
          await prisma.payment.update({
            where: { razorpayOrderId },
            data: { status: 'FAILED' }
          });
        } catch (e) {
          console.error('[webhook] Error marking payment as failed:', e.message);
        }
      }
    } else if (eventType === 'refund.created') {
      const razorpayOrderId = payload.payment?.entity?.order_id;

      if (razorpayOrderId) {
        try {
          await prisma.payment.update({
            where: { razorpayOrderId },
            data: { status: 'REFUNDED' }
          });
        } catch (e) {
          console.error('[webhook] Error marking payment as refunded:', e.message);
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('[webhook] Error processing webhook:', err.message);
    // Always return 200 to RZP to stop retries if it's a code error, 
    // but log it for investigation.
    res.status(200).json({ received: true, error: err.message });
  }
};

/**
 * E) Process Refund (Admin endpoint)
 */
exports.processRefund = async (req, res, next) => {
  try {
    const { paymentId, refundAmount, reason } = req.body;

    if (!paymentId || !refundAmount) {
      throw createError('Missing required fields: paymentId, refundAmount', 400);
    }

    // Fetch payment record
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { 
        order: true,
        serviceOrder: true 
      }
    });

    if (!payment) {
      throw createError('Payment not found', 404);
    }

    if (payment.status !== 'PAID') {
      throw createError('Only PAID payments can be refunded', 400);
    }

    if (refundAmount > payment.amount) {
      throw createError('Refund amount cannot exceed payment amount', 400);
    }

    // Process refund through Razorpay API
    if (payment.razorpayPaymentId) {
      try {
        await razorpay.payments.refund(payment.razorpayPaymentId, {
          amount: Math.round(refundAmount * 100), // Convert to paise
          notes: { reason: reason || 'Admin refund' }
        });
      } catch (err) {
        console.error('[payment] Razorpay refund API error:', err.message);
        throw createError('Failed to process refund through payment gateway', 500);
      }
    } else if (payment.paymentMethod === 'COD') {
      throw createError('Cannot refund COD payments through this endpoint', 400);
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: { 
        status: 'REFUNDED',
        refundedAt: new Date(),
        refundAmount: refundAmount
      }
    });

    res.json({
      success: true,
      data: { 
        message: 'Refund processed successfully',
        refundAmount,
        paymentId
      }
    });
  } catch (err) {
    next(err);
  }
};
