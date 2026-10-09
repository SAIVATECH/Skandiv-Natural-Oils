import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const couponCreateSchema = z.object({
  code: z.string().min(2, 'Coupon code must be at least 2 characters').toUpperCase(),
  description: z.string().optional().nullable(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']).default('PERCENTAGE'),
  discountValue: z.number().positive('Discount value must be greater than 0'),
  minOrderAmount: z.number().nonnegative().default(0),
  maxDiscount: z.number().positive().optional().nullable(),
  isActive: z.boolean().default(true),
  expiresAt: z.string().optional().nullable(),
});

/**
 * GET all coupons
 * Path: GET /api/coupons
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const whereClause: any = {};
    if (activeOnly) {
      whereClause.isActive = true;
      whereClause.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ];
    }

    try {
      const coupons = await (prisma as any).coupon.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(coupons);
    } catch (dbErr) {
      // Fallback if coupons table not yet created in remote DB
      console.warn('[Coupons GET Warning] Fallback default coupons:', dbErr);
      const defaultCoupons = [
        {
          id: 'default-1',
          code: 'SKANDIV10',
          description: '10% off on all Mara Chekku organic oils',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          minOrderAmount: 0,
          maxDiscount: 200,
          isActive: true,
          expiresAt: null,
          createdAt: new Date(),
        },
        {
          id: 'default-2',
          code: 'WELCOME10',
          description: 'Welcome 10% discount for new customers',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          minOrderAmount: 0,
          maxDiscount: 200,
          isActive: true,
          expiresAt: null,
          createdAt: new Date(),
        },
        {
          id: 'default-3',
          code: 'ORGANIC50',
          description: 'Flat ₹50 off on orders above ₹500',
          discountType: 'FIXED',
          discountValue: 50,
          minOrderAmount: 500,
          maxDiscount: 50,
          isActive: true,
          expiresAt: null,
          createdAt: new Date(),
        },
      ];
      return NextResponse.json(activeOnly ? defaultCoupons.filter(c => c.isActive) : defaultCoupons);
    }
  } catch (error: any) {
    console.error('[API Coupons GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch coupons' }, { status: 500 });
  }
}

/**
 * POST Create a new coupon (Admin)
 * Path: POST /api/coupons
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = couponCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid coupon details', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      isActive,
      expiresAt,
    } = validation.data;

    const normalizedCode = code.trim().toUpperCase();

    // Check if coupon code already exists
    const existing = await (prisma as any).coupon.findUnique({
      where: { code: normalizedCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Coupon code "${normalizedCode}" already exists. Please choose a different code.` },
        { status: 409 }
      );
    }

    const coupon = await (prisma as any).coupon.create({
      data: {
        code: normalizedCode,
        description: description || null,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscount: maxDiscount || null,
        isActive,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error: any) {
    console.error('[API Coupons POST Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create coupon' },
      { status: 500 }
    );
  }
}
