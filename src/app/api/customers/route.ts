import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET all customers (with aggregated order counts and total spent)
 * Path: GET /api/customers
 */
export async function GET() {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      include: {
        orders: {
          select: {
            totalAmount: true,
            paymentStatus: true,
          },
        },
        state: {
          select: {
            currentStep: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format output with aggregated spending metrics
    const formattedCustomers = customers.map((cust: any) => {
      const completedOrders = cust.orders.filter((o: any) => o.paymentStatus === 'PAID');
      const totalSpent = completedOrders.reduce((sum: number, order: any) => sum + Number(order.totalAmount), 0);

      return {
        id: cust.id,
        name: cust.name || 'WhatsApp Buyer',
        whatsappNumber: cust.whatsappNumber,
        createdAt: cust.createdAt,
        totalOrders: cust.orders.length,
        completedOrders: completedOrders.length,
        totalSpent,
        conversationStep: cust.state?.currentStep || 'INACTIVE',
        conversationUpdatedAt: cust.state?.updatedAt || null,
      };
    });

    return NextResponse.json(formattedCustomers);
  } catch (error) {
    console.error('[API Customers GET Error]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
