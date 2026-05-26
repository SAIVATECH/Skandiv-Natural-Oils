import Razorpay from 'razorpay';
import crypto from 'crypto';

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const isMock = !keyId || keyId.includes('mock') || !keySecret || keySecret.includes('mock');
const razorpayInstance = !isMock && keyId && keySecret ? new Razorpay({ key_id: keyId, key_secret: keySecret }) : null;

/**
 * Creates a dynamic Razorpay Payment Link for a specific order.
 * If credentials are not set, it returns a local mock checkout URL.
 */
export async function createPaymentLink(
  orderId: string,
  amount: number,
  customerName: string,
  customerPhone: string
) {
  const amountInPaise = Math.round(amount * 100); // Razorpay requires amount in paise (1 INR = 100 Paise)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  console.log(`[Razorpay Link Generation] OrderId: ${orderId}, Amount: ₹${amount}, Customer: ${customerName}`);

  if (isMock || !razorpayInstance) {
    // Generate a mock payment checkout link pointing to our Next.js dev server
    const mockPaymentLink = `${appUrl}/checkout/mock?orderId=${orderId}&amount=${amount}&phone=${encodeURIComponent(customerPhone)}`;
    console.log(`[Razorpay Mock] Created simulated checkout page link: ${mockPaymentLink}`);
    return {
      id: `plink_mock_${Math.random().toString(36).substring(2, 11)}`,
      short_url: mockPaymentLink,
      status: 'created',
    };
  }

  try {
    // Clean phone number: remove any "whatsapp:" prefix and plus symbol
    const cleanPhone = customerPhone.replace('whatsapp:', '').replace('+', '').trim();

    const paymentLink = await razorpayInstance.paymentLink.create({
      amount: amountInPaise,
      currency: 'INR',
      accept_partial: false,
      reference_id: orderId,
      description: `Payment for Store Order #${orderId.substring(0, 8).toUpperCase()}`,
      customer: {
        name: customerName || 'WhatsApp Customer',
        contact: cleanPhone || '9999999999',
      },
      notify: {
        sms: false,
        email: false,
      },
      reminder_enable: true,
      notes: {
        order_id: orderId,
      },
      callback_url: `${appUrl}/admin/orders`,
      callback_method: 'get',
    });

    return {
      id: paymentLink.id,
      short_url: paymentLink.short_url,
      status: paymentLink.status,
    };
  } catch (error) {
    console.error('[Razorpay Error] Failed to generate dynamic payment link:', error);
    throw error;
  }
}

/**
 * Validates incoming webhook signature sent by Razorpay to verify origin authenticity.
 */
export function verifyRazorpaySignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  if (isMock) {
    console.log('[Razorpay Webhook Verification] Bypassed in local mock development.');
    return true;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');
    
    return expectedSignature === signature;
  } catch (error) {
    console.error('[Razorpay Signature Verification Error] Cryptographic validation failed:', error);
    return false;
  }
}
