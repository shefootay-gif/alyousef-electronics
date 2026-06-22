import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = 'AL-YOUSEF Electronics <onboarding@resend.dev>';

export async function sendOrderConfirmation(
  toEmail: string,
  orderDetails: {
    orderNumber: string;
    total: string;
    items: Array<{ name: string; quantity: number; price: string }>;
  }
) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not set. Email not sent.");
    return;
  }

  const itemsHtml = orderDetails.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.price} EGP</td>
    </tr>
  `
    )
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #D4AF37;">
        <h1 style="color: #D4AF37; margin: 0;">AL-YOUSEF Electronics</h1>
        <p style="margin: 5px 0 0; font-size: 16px; color: #666;">Your Order Confirmation</p>
      </div>
      
      <div style="padding: 20px 0;">
        <h2 style="font-size: 20px;">Thank you for your order!</h2>
        <p>We've received your order <strong>#${orderDetails.orderNumber}</strong>.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 8px; background-color: #f9f9f9;">Item</th>
              <th style="text-align: center; padding: 8px; background-color: #f9f9f9;">Qty</th>
              <th style="text-align: right; padding: 8px; background-color: #f9f9f9;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 15px 8px 8px; text-align: right; font-weight: bold;">Total:</td>
              <td style="padding: 15px 8px 8px; text-align: right; font-weight: bold; color: #D4AF37;">${orderDetails.total} EGP</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: "Order Confirmed: #" + orderDetails.orderNumber,
      html: html,
    });
  } catch (error) {
    console.error("Email error:", error);
  }
}

export async function sendOrderStatusUpdate(
  toEmail: string,
  orderDetails: {
    orderNumber: string;
    status: string;
  }
) {
  if (!resend) return;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h1 style="color: #D4AF37;">AL-YOUSEF Electronics</h1>
      <p>Your order <strong>#${orderDetails.orderNumber}</strong> is now: <strong>${orderDetails.status.replace('_', ' ')}</strong></p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: "Order Update: #" + orderDetails.orderNumber,
      html: html,
    });
  } catch (error) {
    console.error("Email error:", error);
  }
}
