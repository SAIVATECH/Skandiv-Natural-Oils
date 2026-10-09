import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    const email = searchParams.get('email');

    if (!phone && !email) {
      return NextResponse.json(
        { error: 'Please provide a WhatsApp phone number or email to lookup orders.' },
        { status: 400 }
      );
    }

    const whereUser: any = {};
    if (phone) {
      let cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;
      whereUser.whatsappNumber = cleanPhone;
    } else if (email) {
      whereUser.email = email.trim().toLowerCase();
    }

    const user = await prisma.user.findFirst({
      where: whereUser,
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    slug: true,
                    imageUrl: true,
                    price: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({
        found: false,
        message: 'No customer account found for this contact details.',
        orders: [],
      });
    }

    return NextResponse.json({
      found: true,
      customer: {
        name: user.name,
        whatsappNumber: user.whatsappNumber,
        email: user.email,
        totalOrders: user.orders.length,
      },
      orders: user.orders,
    });
  } catch (error: any) {
    console.error('[API Customer Orders Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch customer orders' },
      { status: 500 }
    );
  }
}
