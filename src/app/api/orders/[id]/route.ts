import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { orderStatusSchema } from '@/validations/schemas';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

/**
 * PUT Update Order Status (and notify user on WhatsApp)
 * Path: PUT /api/orders/[id]
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Validate inputs
    const validatedData = orderStatusSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { errors: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!order) {
      return new NextResponse('Order not found', { status: 404 });
    }

    const { orderStatus, paymentStatus, trackingUrl } = validatedData.data;

    // Detect status transitions to trigger corresponding WhatsApp alerts
    const statusChanged = orderStatus !== order.orderStatus;
    
    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        orderStatus,
        paymentStatus,
        trackingUrl: trackingUrl || null,
      },
    });

    console.log(`[API Order PUT] Order ${id} updated to status ${orderStatus}, payment ${paymentStatus}`);

    // If order status was changed, send dynamic customer update on WhatsApp
    if (statusChanged) {
      const customer = order.user;
      let updateMsg = '';

      if (orderStatus === 'PROCESSING') {
        updateMsg = `⚙️ *Order Update*\n\nHi *${customer.name || 'there'}*! Your order *#${order.id.substring(0, 8).toUpperCase()}* is now being processed by our warehouse. We will notify you once it ships! 📦`;
      } else if (orderStatus === 'SHIPPED') {
        const liveTracking = trackingUrl || order.trackingUrl || '';
        updateMsg = `🚚 *Your Order has Shipped!*\n\nHi *${customer.name || 'there'}*! Great news — your order *#${order.id.substring(0, 8).toUpperCase()}* is on the way! 🎉\n\n` +
          (liveTracking ? `🔗 *Live Tracking Link:* ${liveTracking}\n\n` : '') +
          `Get ready to receive your package soon! 🛍️`;
      } else if (orderStatus === 'DELIVERED') {
        updateMsg = `🎉 *Order Delivered!*\n\nHi *${customer.name || 'there'}*! Your order *#${order.id.substring(0, 8).toUpperCase()}* has been successfully delivered. 📦\n\nWe hope you love your new product! If you enjoyed shopping with us, let us know! 🛍️`;
      } else if (orderStatus === 'CANCELLED') {
        updateMsg = `🚫 *Order Cancelled*\n\nHi *${customer.name || 'there'}*! Your order *#${order.id.substring(0, 8).toUpperCase()}* has been cancelled. If this is a mistake or you have questions, please get in touch with us here.`;
      }

      if (updateMsg) {
        sendWhatsAppMessage(customer.whatsappNumber, updateMsg).catch((err: any) => {
          console.error(`[Meta Async Status Alert Error] Failed to alert customer on WhatsApp for order ${id}:`, err);
        });
      }
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('[API Order PUT Error]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * DELETE Order
 * Path: DELETE /api/orders/[id]
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return new NextResponse('Order not found', { status: 404 });
    }

    // Delete related OrderItems first
    await prisma.orderItem.deleteMany({
      where: { orderId: id },
    });

    // Delete related payments
    await prisma.payment.deleteMany({
      where: { orderId: id },
    });

    // Delete the order itself
    await prisma.order.delete({
      where: { id },
    });

    console.log(`[API Order DELETE] Order ${id} and associated items successfully deleted.`);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[API Order DELETE Error]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
