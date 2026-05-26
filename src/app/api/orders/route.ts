import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET all orders
 * Path: GET /api/orders
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderStatus = searchParams.get('orderStatus');
    const paymentStatus = searchParams.get('paymentStatus');
    const search = searchParams.get('search');

    const whereClause: any = {};

    if (orderStatus) {
      whereClause.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      whereClause.paymentStatus = paymentStatus;
    }

    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { whatsappNumber: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            whatsappNumber: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('[API Orders GET Error]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * POST Create a dummy pending order for simulator testing
 * Path: POST /api/orders
 */
export async function POST(req: Request) {
  try {
    // Find Rohan Sharma (seeded customer)
    let user = await prisma.user.findUnique({
      where: { whatsappNumber: '918888888888' },
    });

    if (!user) {
      // Create user if not exists
      user = await prisma.user.create({
        data: {
          whatsappNumber: '918888888888',
          name: 'Rohan Sharma',
          role: 'CUSTOMER',
        },
      });
    }

    // Find any active product
    const product = await prisma.product.findFirst({
      where: { isActive: true, stock: { gt: 0 } },
    });

    if (!product) {
      return new NextResponse('No active products in stock to create demo order', { status: 400 });
    }

    // Create a pending order for 1 unit of this product
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: product.price,
        paymentStatus: 'PENDING',
        orderStatus: 'PENDING',
        items: {
          create: {
            productId: product.id,
            quantity: 1,
            price: product.price,
          },
        },
      },
      include: {
        user: true,
      },
    });

    // Create a matching conversation state so they are in AWAITING_PAYMENT state
    await prisma.conversationState.upsert({
      where: { userId: user.id },
      update: {
        currentStep: 'AWAITING_PAYMENT',
        selectedProductId: product.id,
        quantity: 1,
        pendingOrderId: order.id,
      },
      create: {
        userId: user.id,
        currentStep: 'AWAITING_PAYMENT',
        selectedProductId: product.id,
        quantity: 1,
        pendingOrderId: order.id,
      },
    });

    console.log(`[API Orders POST] Created dummy pending order ${order.id} for Rohan Sharma.`);
    return NextResponse.json(order);
  } catch (error) {
    console.error('[API Orders POST Error]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

