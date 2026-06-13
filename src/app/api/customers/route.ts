import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { customerSchema } from '@/validations/schemas';

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

/**
 * POST manually create a customer
 * Path: POST /api/customers
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate inputs
    const validatedData = customerSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { errors: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, whatsappNumber } = validatedData.data;

    // Check if customer already exists
    const existing = await prisma.user.findUnique({
      where: { whatsappNumber },
    });

    if (existing) {
      return NextResponse.json(
        { errors: { whatsappNumber: ['WhatsApp number is already registered'] } },
        { status: 400 }
      );
    }

    // Create manual customer
    const newCustomer = await prisma.user.create({
      data: {
        name,
        whatsappNumber,
        role: 'CUSTOMER',
      },
    });

    // Initialize conversation state for the new customer
    await prisma.conversationState.create({
      data: {
        userId: newCustomer.id,
        currentStep: 'START',
      },
    });

    return NextResponse.json({
      id: newCustomer.id,
      name: newCustomer.name,
      whatsappNumber: newCustomer.whatsappNumber,
      createdAt: newCustomer.createdAt,
      totalOrders: 0,
      completedOrders: 0,
      totalSpent: 0,
      conversationStep: 'START',
      conversationUpdatedAt: null,
    });
  } catch (error: any) {
    console.error('[API Customers POST Error]:', error);
    return NextResponse.json(
      { errors: { global: [error.message || 'Internal Server Error'] } },
      { status: 500 }
    );
  }
}
