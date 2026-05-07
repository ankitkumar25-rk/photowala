const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || 'noreply@manufact.in';

/**
 * Send a transactional email
 */
async function sendEmail({ to, subject, html, text }) {
  if (!resend) {
    console.warn('[email] Skipping sendEmail: RESEND_API_KEY is not configured');
    return { skipped: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Email send error:', err);
    throw err;
  }
}

// Pre-built email templates
const emailTemplates = {
  orderConfirmation: (order, user) => ({
    subject: `Order Confirmed #${order.orderNumber} 🎁`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #5a3f2f; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎁 Manufact</h1>
        </div>
        <div style="padding: 30px;">
          <h2>Hi ${user.name}, your order is confirmed! 🎉</h2>
          <p>Order Number: <strong>#${order.orderNumber}</strong></p>
          <p>Total: <strong>₹${order.total}</strong></p>
          <p>We'll send you tracking details once your order ships.</p>
          <a href="${process.env.CLIENT_URL}/orders/${order.id}" 
             style="background: #5a3f2f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">
            Track Order
          </a>
        </div>
      </div>
    `,
  }),

  welcomeEmail: (user) => ({
    subject: 'Welcome to Manufact! 🎁',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #5a3f2f; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎁 Welcome to Manufact</h1>
        </div>
        <div style="padding: 30px;">
          <h2>Hi ${user.name}! 🎉</h2>
          <p>Thank you for joining us. Explore our premium trophies, mementos, and personalized gifts.</p>
          <a href="${process.env.CLIENT_URL}/products"
             style="background: #5a3f2f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">
            Start Shopping
          </a>
        </div>
      </div>
    `,
  }),

  adminNewOrder: (order, user) => ({
    subject: `🚨 New Order Received #${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Order Alert! 📦</h2>
        <p>Order Number: <strong>#${order.orderNumber}</strong></p>
        <p>Customer: <strong>${user.name} (${user.email})</strong></p>
        <p>Total Amount: <strong>₹${order.total}</strong></p>
        <p>Check the admin panel for details.</p>
        <a href="${process.env.ADMIN_URL}/orders/${order.id}" 
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">
          View Order
        </a>
      </div>
    `,
  }),

  adminNewServiceRequest: (request, user) => ({
    subject: `🛠️ New Service Request #${request.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Service Request Alert!</h2>
        <p>Request ID: <strong>#${request.orderNumber}</strong></p>
        <p>Service: <strong>${request.serviceType}</strong></p>
        <p>Customer: <strong>${user?.name || 'Guest'} (${user?.email || 'N/A'})</strong></p>
        <p>Est. Price: <strong>${request.priceRange}</strong></p>
        <a href="${process.env.ADMIN_URL}/service-requests" 
           style="background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">
          View Requests
        </a>
      </div>
    `,
  }),

  passwordReset: (user, resetUrl) => ({
    subject: 'Reset Your Password - Manufact',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="padding: 30px;">
          <h2>Password Reset Request</h2>
          <p>Hi ${user.name}, click the button below to reset your password. This link expires in 15 minutes.</p>
          <a href="${resetUrl}"
             style="background: #e63946; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">
            Reset Password
          </a>
          <p style="color: #666; margin-top: 20px; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
  }),

  serviceRequestStatusUpdate: (request, user, oldStatus) => {
    const statusLabels = {
      NEW: 'New Request',
      IN_PROGRESS: 'In Progress',
      CONFIRMED: 'Confirmed',
      PROCESSING: 'Processing',
      SHIPPED: 'Shipped',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled',
      CLOSED: 'Closed',
    };

    let message = '';
    let emoji = '📦';
    
    if (request.status === 'CONFIRMED') message = 'Your request has been confirmed!';
    else if (request.status === 'PROCESSING') message = 'Your request is now being processed.';
    else if (request.status === 'SHIPPED') message = `Your order has been shipped! Tracking: ${request.trackingNumber || 'N/A'}`;
    else if (request.status === 'DELIVERED') message = 'Your order has been delivered!';
    else if (request.status === 'CANCELLED') { message = 'Your request has been cancelled.'; emoji = '❌'; }
    else if (request.status === 'CLOSED') message = 'Your request has been closed.';
    
    return {
      subject: `${emoji} Service Request Update #${request.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #5a3f2f; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">${emoji} Status Update</h1>
          </div>
          <div style="padding: 30px;">
            <h2>Hi ${user.name},</h2>
            <p>${message}</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Order Number:</strong> #${request.orderNumber}</p>
              <p><strong>Service Type:</strong> ${request.serviceType.replace(/_/g, ' ')}</p>
              <p><strong>Status:</strong> <span style="color: #ea580c; font-weight: bold;">${statusLabels[request.status]}</span></p>
              ${request.trackingNumber ? `<p><strong>Tracking Number:</strong> ${request.trackingNumber}</p>` : ''}
            </div>
            <a href="${process.env.CLIENT_URL}/service-requests"
               style="background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">
              View Request
            </a>
          </div>
        </div>
      `,
    };
  },
};

module.exports = { sendEmail, emailTemplates };
