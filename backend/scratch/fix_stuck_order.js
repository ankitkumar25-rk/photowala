import 'dotenv/config';
import prisma from '../src/lib/prisma.js';

async function fixOrder() {
  const orderNumber = 'ORG-MP7PWF2N-U2XP';
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber }
    });

    if (!order) {
      console.log('Order not found');
      return;
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        paymentMethod: 'RAZORPAY'
      }
    });

    console.log(`Successfully updated order ${orderNumber} to CONFIRMED and PAID`);
  } catch (err) {
    console.error('Error updating order:', err);
  } finally {
    await prisma.$disconnect();
  }
}

fixOrder();
