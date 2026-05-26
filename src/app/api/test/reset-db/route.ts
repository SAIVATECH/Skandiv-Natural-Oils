import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/test/reset-db
 * Wipes the database and seeds it with premium products containing beautiful Unsplash images.
 * Useful for bypassing local terminal TCP port blocks.
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Forbidden in production environment' }, { status: 403 });
  }
  try {
    console.log('[API Reset DB] Initiating database cleanup and seed...');

    // 1. Delete all existing records cleanly
    await prisma.payment.deleteMany({});
    await prisma.conversationState.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('[API Reset DB] Cleaned all tables.');

    // 2. Seed Admin User
    const adminUser = await prisma.user.create({
      data: {
        whatsappNumber: '919999999999',
        name: 'Admin Store Manager',
        role: 'ADMIN',
      },
    });

    // 3. Seed Products with gorgeous high-resolution Unsplash image URLs
    const productsToSeed = [
      {
        name: 'Wireless Noise-Canceling Headphones',
        slug: 'headphones',
        description: 'Experience studio-grade sound with premium active noise cancellation, 40-hour battery life, and ultra-comfortable ear cups.',
        price: 8999.00,
        stock: 50,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
        category: 'Electronics',
        isActive: true,
      },
      {
        name: 'Mechanical Gaming Keyboard',
        slug: 'keyboard',
        description: 'Tactile blue switches, complete customizable RGB backlighting, aircraft-grade aluminum frame, and integrated media controls.',
        price: 4999.00,
        stock: 30,
        imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600',
        category: 'Electronics',
        isActive: true,
      },
      {
        name: 'Ergonomic Office Chair',
        slug: 'chair',
        description: 'High-back desk chair featuring customizable lumbar support, memory foam mesh seat, adjustable armrests, and dynamic recline tilt.',
        price: 12999.00,
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600',
        category: 'Furniture',
        isActive: true,
      },
      {
        name: 'Smart Fitness Tracker',
        slug: 'fitness-tracker',
        description: 'Ultra-slim water-resistant activity tracker with dynamic heart rate tracking, blood oxygen levels (SpO2), sleep monitoring, and a vibrant AMOLED screen.',
        price: 2999.00,
        stock: 100,
        imageUrl: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600',
        category: 'Electronics',
        isActive: true,
      },
      {
        name: 'Stainless Steel Water Bottle',
        slug: 'water-bottle',
        description: 'Double-walled vacuum insulated, food-grade stainless steel bottle. Keeps your beverages ice-cold for up to 24 hours or steaming hot for up to 12 hours.',
        price: 1499.00,
        stock: 200,
        imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600',
        category: 'Lifestyle',
        isActive: true,
      },
    ];

    for (const prod of productsToSeed) {
      await prisma.product.create({
        data: prod,
      });
    }

    console.log('[API Reset DB] Successfully seeded products and admin user.');

    return NextResponse.json({
      success: true,
      message: 'Database successfully wiped and seeded with premium products & images!',
      adminUser: {
        id: adminUser.id,
        whatsappNumber: adminUser.whatsappNumber,
        role: adminUser.role,
      },
      seededProductsCount: productsToSeed.length,
    });
  } catch (error: any) {
    console.error('[API Reset DB Error]:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || String(error),
    }, { status: 500 });
  }
}
