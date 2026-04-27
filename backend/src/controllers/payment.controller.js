const Razorpay = require('razorpay');
const crypto = require('crypto');
const prisma = require('../config/database');
const { createError } = require('../middleware/errorHandler');

const razorpayConfigured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
const razorpay = razorpayConfigured
  ? new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
  : null;

exports.createRazorpayOrder = async (req, res, next) => {
  try {
    if (!razorpay) throw createError('Razorpay is not configured', 503);

    const { orderId } = req.body;
    if (!orderId) throw createError('orderId is required', 400);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });
    if (!order) throw createError('Order not found', 404);
    if (order.userId !== req.user.id) throw createError('Forbidden', 403);
    if (order.payment?.status === 'PAID') throw createError('Order already paid', 400);

    // Amount in paise (INR smallest unit)
    const amountPaise = Math.round(Number(order.total) * 100);

    const rzpOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: order.orderNumber,
      notes: { orderId: order.id },
    });

    // Persist razorpay order ID
    await prisma.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        razorpayOrderId: rzpOrder.id,
        amount: order.total,
        status: 'PENDING',
      },
      update: { razorpayOrderId: rzpOrder.id },
    });

    res.json({
      success: true,
      data: {
        razorpayOrderId: rzpOrder.id,
        amount: amountPaise,
        currency: 'INR',
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) throw createError('Razorpay is not configured', 503);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw createError('Missing payment verification fields', 400);
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });
    if (!order) throw createError('Order not found', 404);
    if (order.userId !== req.user.id) throw createError('Forbidden', 403);
    if (order.payment?.status === 'PAID') {
      return res.json({ success: true, message: 'Payment already verified' });
    }
    if (order.payment?.razorpayOrderId && order.payment.razorpayOrderId !== razorpay_order_id) {
      throw createError('Razorpay order mismatch', 400);
    }

    // Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      throw createError('Payment verification failed', 400);
    }

    // Update payment and order in a transaction
    await prisma.$transaction([
      prisma.payment.update({
        where: { orderId },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: 'PAID',
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { status: 'CONFIRMED' },
      }),
    ]);

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (err) {
    next(err);
  }
};

exports.webhook = async (req, res, next) => {
  try {
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) throw createError('Razorpay webhook is not configured', 503);

    const signature = req.headers['x-razorpay-signature'];
    const body = req.body; // raw buffer (set in app.js)

    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSig !== signature) {
      return res.status(400).json({ success: false });
    }

    const event = JSON.parse(body.toString());

    if (event.event === 'payment.captured') {
      const paymentId = event.payload.payment.entity.id;
      const rzpOrderId = event.payload.payment.entity.order_id;

      await prisma.payment.updateMany({
        where: { razorpayOrderId: rzpOrderId },
        data: { razorpayPaymentId: paymentId, status: 'PAID' },
      });
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
};
