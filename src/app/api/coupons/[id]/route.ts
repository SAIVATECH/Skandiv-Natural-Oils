import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const couponUpdateSchema = z.object({
  code: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
  discountValue: z.number().positive().optional(),
  minOrderAmount: z.number().nonnegative().optional(),
  maxDiscount: z.number().positive().optional().nullable(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().optional().nullable(),
});

/**
 * GET Single Coupon
 * Path: GET /api/coupons/[id]
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const coupon = await (prisma as any).coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json(coupon);
  } catch (error: any) {
    console.error('[API Coupon GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch coupon' }, { status: 500 });
  }
}

/**
 * PUT Update Coupon
 * Path: PUT /api/coupons/[id]
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const validation = couponUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid coupon parameters', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const dataToUpdate: any = { ...validation.data };
    if (dataToUpdate.code) {
      dataToUpdate.code = dataToUpdate.code.trim().toUpperCase();
    }
    if (dataToUpdate.expiresAt !== undefined) {
      dataToUpdate.expiresAt = dataToUpdate.expiresAt ? new Date(dataToUpdate.expiresAt) : null;
    }

    const updated = await (prisma as any).coupon.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[API Coupon PUT Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to update coupon' }, { status: 500 });
  }
}

/**
 * DELETE Coupon
 * Path: DELETE /api/coupons/[id]
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await (prisma as any).coupon.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error: any) {
    console.error('[API Coupon DELETE Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete coupon' }, { status: 500 });
  }
}
