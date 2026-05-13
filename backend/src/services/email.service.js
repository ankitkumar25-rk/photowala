import { sendMail } from '../lib/mailer.js';

const BRAND_COLOR = '#C85212';
const BG_COLOR = '#FDF6F0';

const baseTemplate = (content) => `
  <div style="font-family: sans-serif; background-color: ${BG_COLOR}; padding: 40px 20px; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: ${BRAND_COLOR}; padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">PhotowalaGift</h1>
      </div>
      <div style="padding: 40px;">
        ${content}
      </div>
      <div style="padding: 20px; text-align: center; border-top: 1px solid #eeeeee; font-size: 12px; color: #999;">
        <p>&copy; ${new Date().getFullYear()} PhotowalaGift. All rights reserved.</p>
      </div>
    </div>
  </div>
`;

export const emailService = {
  async sendOrderConfirmation({ to, userName, orderId, items, total, deliveryDate }) {
    const gst = (total * 0.18).toFixed(2);
    const subtotal = (total - gst).toFixed(2);

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee;">${item.name} x ${item.qty}</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; text-align: right;">₹${item.price}</td>
      </tr>
    `).join('');

    const content = `
      <h2 style="color: ${BRAND_COLOR}; margin-bottom: 20px;">Order Confirmed!</h2>
      <p>Hello <strong>${userName}</strong>,</p>
      <p>Your order <strong>#${orderId}</strong> has been successfully placed. We are preparing it for dispatch.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 30px 0;">
        <thead>
          <tr>
            <th style="text-align: left; padding-bottom: 10px; border-bottom: 2px solid #eeeeee;">Item</th>
            <th style="text-align: right; padding-bottom: 10px; border-bottom: 2px solid #eeeeee;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td style="padding-top: 20px; font-weight: bold;">Subtotal</td>
            <td style="padding-top: 20px; text-align: right; font-weight: bold;">₹${subtotal}</td>
          </tr>
          <tr>
            <td style="padding-top: 5px; color: #666; font-size: 14px;">GST (18%)</td>
            <td style="padding-top: 5px; text-align: right; color: #666; font-size: 14px;">₹${gst}</td>
          </tr>
          <tr>
            <td style="padding-top: 10px; font-size: 18px; font-weight: bold; color: ${BRAND_COLOR};">Total</td>
            <td style="padding-top: 10px; text-align: right; font-size: 18px; font-weight: bold; color: ${BRAND_COLOR};">₹${total}</td>
          </tr>
        </tfoot>
      </table>

      <div style="background-color: ${BG_COLOR}; padding: 15px; border-radius: 8px; text-align: center; margin-top: 30px;">
        <p style="margin: 0; font-size: 14px; color: #555;">Estimated Delivery: <strong>${deliveryDate}</strong></p>
      </div>
    `;

    return sendMail({
      to,
      subject: `Order Confirmed – #${orderId} | PhotowalaGift`,
      html: baseTemplate(content),
    });
  },

  async sendServiceOrderConfirmation({ to, userName, serviceOrderId, serviceName, amount }) {
    const content = `
      <h2 style="color: ${BRAND_COLOR}; margin-bottom: 20px;">Request Received</h2>
      <p>Hello <strong>${userName}</strong>,</p>
      <p>We have received your service request for <strong>${serviceName}</strong> (Ref: #${serviceOrderId}).</p>
      <p>Our team is currently reviewing your requirements and will get back to you shortly with more details.</p>
      
      <div style="border: 1px solid #eeeeee; border-radius: 8px; padding: 20px; margin-top: 30px;">
        <p style="margin: 0; color: #666;">Service: <span style="color: #333; font-weight: bold;">${serviceName}</span></p>
        <p style="margin: 5px 0 0; color: #666;">Estimated Amount: <span style="color: ${BRAND_COLOR}; font-weight: bold;">₹${amount}</span></p>
      </div>
    `;

    return sendMail({
      to,
      subject: "Service Request Received – PhotowalaGift",
      html: baseTemplate(content),
    });
  },

  async sendOtpEmail({ to, userName, otp }) {
    const content = `
      <h2 style="color: ${BRAND_COLOR}; margin-bottom: 20px;">Security Verification</h2>
      <p>Hello <strong>${userName}</strong>,</p>
      <p>Your one-time password (OTP) is:</p>
      <div style="font-size: 36px; font-weight: bold; letter-spacing: 5px; color: ${BRAND_COLOR}; text-align: center; margin: 40px 0; background-color: ${BG_COLOR}; padding: 20px; border-radius: 12px;">
        ${otp}
      </div>
      <p style="color: #666; font-size: 14px; text-align: center;">This OTP is valid for 5 minutes. For security reasons, never share this code with anyone.</p>
    `;

    return sendMail({
      to,
      subject: "Your OTP – PhotowalaGift",
      html: baseTemplate(content),
    });
  },

  async sendPasswordResetEmail({ to, userName, resetLink }) {
    const content = `
      <h2 style="color: ${BRAND_COLOR}; margin-bottom: 20px;">Reset Your Password</h2>
      <p>Hello <strong>${userName}</strong>,</p>
      <p>We received a request to reset your password. Click the button below to proceed:</p>
      <div style="text-align: center; margin: 40px 0;">
        <a href="${resetLink}" style="background-color: ${BRAND_COLOR}; color: #ffffff; padding: 16px 32px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 8px rgba(200, 82, 18, 0.2);">
          Reset Password
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">This link will expire in 30 minutes. If you didn't request this, you can safely ignore this email.</p>
    `;

    return sendMail({
      to,
      subject: "Reset Your Password – PhotowalaGift",
      html: baseTemplate(content),
    });
  },

  async sendWelcomeEmail({ to, userName }) {
    const content = `
      <h2 style="color: ${BRAND_COLOR}; margin-bottom: 20px;">Welcome to the Family!</h2>
      <p>Hello <strong>${userName}</strong>,</p>
      <p>We're thrilled to have you at <strong>PhotowalaGift</strong>. Discover our premium collection of personalized gifts, trophies, and professional printing services.</p>
      <p>Let's make some memories together!</p>
      <div style="text-align: center; margin: 40px 0;">
        <a href="${process.env.CLIENT_URL || '#'}" style="background-color: ${BRAND_COLOR}; color: #ffffff; padding: 16px 32px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
          Start Shopping
        </a>
      </div>
    `;

    return sendMail({
      to,
      subject: "Welcome to PhotowalaGift!",
      html: baseTemplate(content),
    });
  }
};
