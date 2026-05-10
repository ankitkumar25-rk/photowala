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
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
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

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .toString('hex');

    const isValid = expected === razorpay_signature;

    if (!isValid) {
      await prisma.payment.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: { status: 'FAILED' },
      });
      throw createError('Payment verification failed', 400);
    }

    // Success
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
            include: { user: true }
          })
        : prisma.serviceOrder.update({
            where: { id: internalOrderId },
            data: { paymentStatus: 'PAID', paymentMethod: 'RAZORPAY' },
            include: { user: true }
          })
    ]);

    // Send confirmation email (non-blocking)
    // You would typically fetch the user and order details here
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (user) {
      // Logic for sending email... 
      // Assuming a generic template or specialized one exists
      // const tpl = emailTemplates.orderConfirmation(user, order);
      // await sendEmail({ to: user.email, ...tpl });
    }

    res.json({ success: true, paymentId: razorpay_payment_id });
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

    await prisma.$transaction([
      orderType === 'ORDER'
        ? prisma.order.update({
            where: { id: internalOrderId },
            data: { paymentMethod: 'COD', paymentStatus: 'COD_PENDING' }
          })
        : prisma.serviceOrder.update({
            where: { id: internalOrderId },
            data: { paymentMethod: 'COD', paymentStatus: 'COD_PENDING' }
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

    // Send COD confirmation email...

    res.json({ success: true, message: 'COD order confirmed' });
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
      console.warn('[webhook] Invalid signature received');
      return res.status(400).send('Invalid signature');
    }

    const event = JSON.parse(req.body.toString());
    const { payload, event: eventType } = event;

    console.log(`[webhook] Received event: ${eventType}`);

    if (eventType === 'payment.captured') {
      const razorpayOrderId = payload.payment.entity.order_id;
      const razorpayPaymentId = payload.payment.entity.id;

      // Update payment record to PAID if not already
      const payment = await prisma.payment.findUnique({ where: { razorpayOrderId } });
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
                data: { paymentStatus: 'PAID', paymentMethod: 'RAZORPAY' }
              })
        ]);
      }
    } else if (eventType === 'payment.failed') {
      const razorpayOrderId = payload.payment.entity.order_id;
      await prisma.payment.update({
        where: { razorpayOrderId },
        data: { status: 'FAILED' }
      });
      // Optionally notify user via email about failed payment
    } else if (eventType === 'refund.created') {
       const razorpayOrderId = payload.payment.entity.order_id;
       await prisma.payment.update({
         where: { razorpayOrderId },
         data: { status: 'REFUNDED' }
       });
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('[webhook] Error processing webhook:', err.message);
    // Always return 200 to RZP to stop retries if it's a code error, 
    // but log it for investigation.
    res.status(200).json({ received: true, error: err.message });
  }
};
