import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

/**
 * Webhook Endpoint for Razorpay Payment Notifications.
 * Validates cryptographic signatures, verifies payments, and updates order states.
 * 
 * Path: POST /api/webhooks/razorpay
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    // Verify webhook signature (supports bypass signature in local mock checkout)
    const isMockBypass = signature === 'mock_signature_bypass';
    if (!isMockBypass && !verifyRazorpaySignature(rawBody, signature, webhookSecret)) {
      console.warn('[Razorpay Webhook] Invalid cryptographic signature received.');
      return new NextResponse('Invalid Webhook Signature', { status: 400 });
    }

    const body = JSON.parse(rawBody);
    const event = body.event;

    console.log(`[Razorpay Webhook Event] Received: "${event}"`);

    // Handle completed payment links
    if (event === 'payment_link.paid' || event === 'payment.captured') {
      const paymentLinkData = body.payload.payment_link?.entity;
      const paymentData = body.payload.payment?.entity;

      const orderId = paymentLinkData?.reference_id || paymentData?.notes?.order_id;
      const paymentId = paymentData?.id || paymentLinkData?.id;
      const amountInPaise = paymentData?.amount || paymentLinkData?.amount;
      const actualAmount = amountInPaise ? amountInPaise / 100 : 0;

      if (!orderId) {
        console.warn('[Razorpay Webhook] Webhook payload missing order Reference ID.');
        return new NextResponse('Reference ID not found', { status: 400 });
      }

      // Retrieve Order from PostgreSQL (with items)
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        console.warn(`[Razorpay Webhook] Order not found for reference: ${orderId}`);
        return new NextResponse('Order not found', { status: 404 });
      }

      // 1. Duplicate webhook hit check
      if (order.paymentStatus === 'PAID') {
        console.log(`[Razorpay Webhook] Order ${order.id} is already processed. Responding 200.`);
        return new NextResponse('Order already processed', { status: 200 });
      }

      // 2. Begin transaction update
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const trackingUrl = `${appUrl}/orders/${order.id}/track`;

      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Update Order Details
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'PAID',
            orderStatus: 'PROCESSING',
            razorpayPaymentId: paymentId,
            trackingUrl: trackingUrl,
          },
        });

        // Record Payment Details
        await tx.payment.create({
          data: {
            orderId: order.id,
            razorpayPaymentId: paymentId,
            amount: actualAmount,
            status: 'captured',
          },
        });

        // Deduct inventory stock for purchased products
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      });

      console.log(`[Razorpay Webhook] Database updated. Order ${order.id} paid. Stock decremented.`);

      // 3. Reset customer conversation state back to START
      const user = await prisma.user.findUnique({
        where: { id: order.userId },
      });

      if (user) {
        await prisma.conversationState.update({
          where: { userId: user.id },
          data: {
            currentStep: 'START',
            selectedProductId: null,
            quantity: null,
            pendingOrderId: null,
          },
        });

        // 4. Send successful WhatsApp notification to customer
        const confirmationMsg = `💳 *Payment Verified!*\n` +
          `----------------------------------\n` +
          `Thank you, *${user.name || 'valued customer'}*! Your payment of *₹${actualAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}* has been successfully processed.\n\n` +
          `📦 *Order ID:* #${order.id.substring(0, 8).toUpperCase()}\n` +
          `🚚 *Shipment Status:* Processing\n\n` +
          `You can monitor your package live at any time using this tracking link:\n` +
          `🔗 ${trackingUrl}\n` +
          `----------------------------------\n` +
          `Thank you for shopping with us! 🛍️`;

        await sendWhatsAppMessage(user.whatsappNumber, confirmationMsg);
      }
    }

    return new NextResponse('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('[Razorpay Webhook Error] Webhook processing failed:', error);
    return new NextResponse('Internal Webhook Error', { status: 500 });
  }
}
