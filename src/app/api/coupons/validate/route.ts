import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST Validate a coupon code against current cart subtotal
 * Path: POST /api/coupons/validate
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, subtotal } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, message: 'Please enter a coupon code' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const subtotalNum = Number(subtotal) || 0;

    let coupon = null;

    try {
      coupon = await (prisma as any).coupon.findUnique({
        where: { code: cleanCode },
      });
    } catch (dbErr) {
      console.warn('[Coupon Validate Warning] Database query fallback:', dbErr);
    }

    // Default fallback coupons if table empty or during transition
    if (!coupon) {
      if (cleanCode === 'SKANDIV10' || cleanCode === 'WELCOME10') {
        const discount = Math.round(subtotalNum * 0.1);
        return NextResponse.json({
          valid: true,
          discount,
          code: cleanCode,
          message: '10% discount applied to your order!',
        });
      } else if (cleanCode === 'ORGANIC50') {
        if (subtotalNum < 500) {
          return NextResponse.json({
            valid: false,
            message: 'ORGANIC50 requires a minimum order value of ₹500',
          });
        }
        return NextResponse.json({
          valid: true,
          discount: 50,
          code: cleanCode,
          message: 'Flat ₹50 discount applied!',
        });
      }

      return NextResponse.json({
        valid: false,
        message: 'Invalid or expired coupon code',
      });
    }

    // Check if active
    if (!coupon.isActive) {
      return NextResponse.json({
        valid: false,
        message: 'This coupon is no longer active',
      });
    }

    // Check expiry date
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({
        valid: false,
        message: 'This coupon has expired',
      });
    }

    // Check minimum order value
    const minOrder = Number(coupon.minOrderAmount);
    if (subtotalNum < minOrder) {
      return NextResponse.json({
        valid: false,
        message: `This coupon requires a minimum cart value of ₹${minOrder}`,
      });
    }

    // Calculate discount
    let calculatedDiscount = 0;
    const discountVal = Number(coupon.discountValue);

    if (coupon.discountType === 'PERCENTAGE') {
      calculatedDiscount = Math.round((subtotalNum * discountVal) / 100);
      if (coupon.maxDiscount) {
        calculatedDiscount = Math.min(calculatedDiscount, Number(coupon.maxDiscount));
      }
    } else {
      // FIXED
      calculatedDiscount = discountVal;
    }

    calculatedDiscount = Math.min(calculatedDiscount, subtotalNum);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount: calculatedDiscount,
      discountType: coupon.discountType,
      discountValue: discountVal,
      message: `${coupon.description || `Coupon ${coupon.code} applied!`}`,
    });

  } catch (error: any) {
    console.error('[API Coupon Validate Error]:', error);
    return NextResponse.json(
      { valid: false, message: error.message || 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
