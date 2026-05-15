import crypto from 'crypto';
import prisma from '../lib/prisma.js';
import razorpay from '../config/razorpay.js';
import { createError } from '../middleware/errorHandler.js';
import { sendEmail, emailTemplates } from '../config/email.js';
import asyncHandler from '../utils/asyncHandler.js';

// Startup validation logs
console.log('[Razorpay] key_id loaded:', !!process.env.RAZORPAY_KEY_ID);
console.log('[Razorpay] key_secret loaded:', !!process.env.RAZORPAY_KEY_SECRET);

/**
 * A) Create Razorpay Order
 */
export const createRazorpayOrder = asyncHandler(async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { amount, currency = 'INR', orderId, orderType } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' });
    }

    if (!amount || !orderType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const amountInPaise = Math.round(Number(amount) * 100);
    if (!amountInPaise || amountInPaise < 100) {
      return res.status(400).json({ message: 'Invalid amount. Minimum ₹1.' });
    }

    const validOrderTypes = ['ORDER', 'SERVICE_ORDER'];
    if (!validOrderTypes.includes(orderType)) {
      return res.status(400).json({ message: `Invalid orderType. Must be one of: ${validOrderTypes.join(', ')}` });
    }

    const options = {
      amount: amountInPaise,
      currency,
      receipt: orderId,
    };

    let rzpOrder;
    try {
      rzpOrder = await razorpay.orders.create(options);
    } catch (razorpayError) {
      console.error('[Razorpay Order Error]', JSON.stringify(razorpayError));
      return res.status(502).json({
        success: false,
        message: 'Payment gateway error',
        detail: razorpayError?.error?.description || razorpayError?.message || 'Unknown Razorpay error'
      });
    }

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
    console.error('[General Payment Error]', err);
    next(err);
  }
});

/**
 * B) Verify Razorpay Payment
 */
export const verifyPayment = asyncHandler(async (req, res, next) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      orderId, 
      orderType 
    } = req.body;

    // Log incoming params for debugging
    console.log('[Verify] razorpay_order_id:', razorpay_order_id);
    console.log('[Verify] razorpay_payment_id:', razorpay_payment_id);
    console.log('[Verify] razorpay_signature:', razorpay_signature);

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId || !orderType) {
      throw createError('Missing required payment verification fields', 400);
    }

    const validOrderTypes = ['ORDER', 'SERVICE_ORDER'];
    if (!validOrderTypes.includes(orderType)) {
      throw createError(`Invalid orderType. Must be one of: ${validOrderTypes.join(', ')}`, 400);
    }

    // Razorpay signature = HMAC SHA256 of "razorpay_order_id|razorpay_payment_id"
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    console.log('[Verify] expected:', expectedSignature);
    console.log('[Verify] received:', razorpay_signature);

    // Constant-time comparison
    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(razorpay_signature);
    
    let isValid = false;
    if (expectedBuffer.length === receivedBuffer.length) {
      isValid = crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
    }

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

    const orderData = orderType === 'ORDER'
      ? await prisma.order.findUnique({ where: { id: orderId }, include: { user: true } })
      : await prisma.serviceOrder.findUnique({ where: { id: orderId }, include: { user: true } });

    if (!orderData) {
      throw createError(`${orderType === 'ORDER' ? 'Order' : 'Service Order'} not found`, 404);
    }

    if (orderData.userId !== req.user.id) {
      throw createError('Unauthorized: Payment does not belong to this user', 403);
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
    });

    if (existingPayment && existingPayment.status === 'PAID') {
      return res.json({
        success: true,
        data: {
          paymentId: razorpay_payment_id,
          message: 'Payment already verified successfully',
        },
      });
    }

    await prisma.$transaction([
      prisma.payment.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: { 
          status: 'PAID', 
          razorpayPaymentId: razorpay_payment_id, 
          paidAt: new Date() 
        },
      }),
      orderType === 'ORDER' 
        ? prisma.order.update({
            where: { id: orderId },
            data: { 
              status: 'CONFIRMED',
              paymentStatus: 'PAID', 
              paymentMethod: 'RAZORPAY' 
            },
          })
        : prisma.serviceOrder.update({
            where: { id: orderId },
            data: { 
              status: 'CONFIRMED',
              paymentStatus: 'PAID', 
              paymentMethod: 'RAZORPAY',
            },
          }),
      // Clear cart after successful product order
      ...(orderType === 'ORDER' ? [
        prisma.cart.update({
          where: { userId: req.user.id },
          data: { items: { deleteMany: {} } }
        })
      ] : [])
    ]);

    // Send confirmation email
    try {
      if (orderType === 'ORDER') {
        const tpl = emailTemplates.orderConfirmation(orderData, orderData.user);
        sendEmail({ to: orderData.user.email, ...tpl }).catch(console.error);
      } else {
        const tpl = emailTemplates.serviceRequestStatusUpdate(orderData, orderData.user, 'NEW');
        sendEmail({ to: orderData.user.email, ...tpl }).catch(console.error);
      }
    } catch (err) {
      console.error('[payment] Failed to send confirmation email:', err.message);
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
});

/**
 * C) Confirm Cash on Delivery
 */
export const confirmCOD = asyncHandler(async (req, res) => {
  const { internalOrderId, orderType } = req.body;

  if (!internalOrderId || !orderType) {
    throw createError('Missing required fields', 400);
  }

  const validOrderTypes = ['ORDER', 'SERVICE_ORDER'];
  if (!validOrderTypes.includes(orderType)) {
    throw createError(`Invalid orderType. Must be one of: ${validOrderTypes.join(', ')}`, 400);
  }

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
            status: 'PENDING'
          }
        }),
    prisma.payment.create({
      data: {
        userId: req.user.id,
        internalOrderId,
        orderType,
        amount: 0,
        status: 'COD_PENDING',
        paymentMethod: 'COD'
      }
    }),
    // Clear cart after successful COD product order
    ...(orderType === 'ORDER' ? [
      prisma.cart.update({
        where: { userId: req.user.id },
        data: { items: { deleteMany: {} } }
      })
    ] : [])
  ]);

  res.json({
    success: true,
    data: { message: 'COD order confirmed' },
  });
});

/**
 * D) Razorpay Webhook
 */
export const razorpayWebhook = asyncHandler(async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

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

  if (!payload || !eventType) {
    console.error('[webhook] Invalid payload structure');
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }

  console.log(`[webhook] Processing event type: ${eventType}, timestamp: ${new Date().toISOString()}`);

  if (eventType === 'payment.captured') {
    const razorpayOrderId = payload.payment?.entity?.order_id;
    const razorpayPaymentId = payload.payment?.entity?.id;

    if (!razorpayOrderId || !razorpayPaymentId) {
      console.error('[webhook] Missing payment details in payload');
      return res.status(200).json({ received: true });
    }

    const payment = await prisma.payment.findUnique({ 
      where: { razorpayOrderId } 
    });

    if (payment && payment.status !== 'PAID') {
      const updatedPayment = await prisma.$transaction(async (tx) => {
        const p = await tx.payment.update({
          where: { razorpayOrderId },
          data: { status: 'PAID', razorpayPaymentId, paidAt: new Date() }
        });

        if (p.orderType === 'ORDER') {
          await tx.order.update({
            where: { id: p.internalOrderId },
            data: { paymentStatus: 'PAID', paymentMethod: 'RAZORPAY' }
          });
        } else {
          await tx.serviceOrder.update({
            where: { id: p.internalOrderId },
            data: { 
              paymentStatus: 'PAID', 
              paymentMethod: 'RAZORPAY',
              status: 'CONFIRMED'
            }
          });
        }
        
        // Clear cart after successful product order via webhook
        if (p.orderType === 'ORDER') {
          await tx.cart.update({
            where: { userId: p.userId },
            data: { items: { deleteMany: {} } }
          });
        }

        return p;
      });

      // Send confirmation email in background
      try {
        const orderData = updatedPayment.orderType === 'ORDER'
          ? await prisma.order.findUnique({ where: { id: updatedPayment.internalOrderId }, include: { user: true } })
          : await prisma.serviceOrder.findUnique({ where: { id: updatedPayment.internalOrderId }, include: { user: true } });

        if (orderData?.user?.email) {
          const tpl = updatedPayment.orderType === 'ORDER'
            ? emailTemplates.orderConfirmation(orderData, orderData.user)
            : emailTemplates.serviceRequestStatusUpdate(orderData, orderData.user, 'NEW');
          sendEmail({ to: orderData.user.email, ...tpl }).catch(console.error);
        }
      } catch (err) {
        console.error('[webhook] Failed to send background email:', err.message);
      }
    }
  } else if (eventType === 'payment.failed') {
    const razorpayOrderId = payload.payment?.entity?.order_id;
    if (razorpayOrderId) {
      await prisma.payment.update({
        where: { razorpayOrderId },
        data: { status: 'FAILED' }
      }).catch(e => console.error('[webhook] Error marking payment as failed:', e.message));
    }
  }

  res.status(200).json({ received: true });
});

/**
 * E) Process Refund
 */
export const processRefund = asyncHandler(async (req, res) => {
  const { paymentId, refundAmount, reason } = req.body;

  if (!paymentId || !refundAmount) {
    throw createError('Missing required fields: paymentId, refundAmount', 400);
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
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

  if (payment.razorpayPaymentId) {
    await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: Math.round(refundAmount * 100),
      notes: { reason: reason || 'Admin refund' }
    });
  }

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
});
