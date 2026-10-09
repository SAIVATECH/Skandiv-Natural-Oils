import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import Razorpay from 'razorpay';
import { z } from 'zod';

const checkoutInputSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  whatsappNumber: z.string().min(10, 'Valid 10-digit WhatsApp number is required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().min(5, 'Delivery address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Valid 6-digit Pincode is required'),
  items: z.array(
    z.object({
      id: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1, 'Cart cannot be empty'),
  couponCode: z.string().optional().nullable(),
  campaignId: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = checkoutInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid checkout parameters', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      fullName,
      whatsappNumber,
      email,
      address,
      city,
      state,
      pincode,
      items: cartItems,
      couponCode,
      campaignId
    } = validation.data;

    // Normalize phone number (digits only, prefix 91 if 10 digits)
    let cleanPhone = whatsappNumber.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }

    // 1. Fetch live product prices and stock from database (NEVER trust frontend prices)
    const productIds = cartItems.map(i => i.id);
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
    });

    if (dbProducts.length !== cartItems.length) {
      return NextResponse.json(
        { error: 'Some items in your cart are no longer active or available.' },
        { status: 400 }
      );
    }

    // Verify stock availability
    let calculatedSubtotal = 0;
    const validatedOrderItems: { productId: string; quantity: number; price: Prisma.Decimal; name: string }[] = [];

    for (const item of cartItems) {
      const dbProd = dbProducts.find(p => p.id === item.id);
      if (!dbProd) {
        return NextResponse.json({ error: `Product not found: ${item.id}` }, { status: 400 });
      }

      if (dbProd.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${dbProd.name}". Available: ${dbProd.stock}` },
          { status: 400 }
        );
      }

      const itemPrice = Number(dbProd.price);
      calculatedSubtotal += itemPrice * item.quantity;

      validatedOrderItems.push({
        productId: dbProd.id,
        quantity: item.quantity,
        price: dbProd.price,
        name: dbProd.name,
      });
    }

    // Apply valid coupon discount
    let discount = 0;
    const cleanCoupon = couponCode ? couponCode.trim().toUpperCase() : '';
    if (cleanCoupon === 'SKANDIV10' || cleanCoupon === 'WELCOME10') {
      discount = Math.round(calculatedSubtotal * 0.1);
    } else if (cleanCoupon === 'ORGANIC50' && calculatedSubtotal >= 500) {
      discount = 50;
    }

    // Calculate shipping fee (Free above ₹499 or with FREESHIP coupon)
    let shippingFee = calculatedSubtotal >= 499 || cleanCoupon === 'FREESHIP' ? 0 : 49;
    const finalGrandTotal = Math.max(0, calculatedSubtotal - discount + shippingFee);

    // 2. Upsert Customer in PostgreSQL
    const customer = await prisma.user.upsert({
      where: { whatsappNumber: cleanPhone },
      update: {
        name: fullName,
        email: email || undefined,
      },
      create: {
        whatsappNumber: cleanPhone,
        name: fullName,
        email: email || undefined,
        role: 'CUSTOMER',
      },
    });

    const fullShippingAddress = `${address.trim()}, ${city.trim()}, ${state.trim()} - ${pincode.trim()}`;

    // 3. Create Pending Order in Database
    const order = await prisma.order.create({
      data: {
        userId: customer.id,
        totalAmount: new Prisma.Decimal(finalGrandTotal),
        paymentStatus: 'PENDING',
        orderStatus: 'PENDING',
        shippingAddress: fullShippingAddress,
        items: {
          create: validatedOrderItems.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
          })),
        },
      },
    });

    console.log(`[Checkout Order Created] ID: ${order.id} | Customer: ${fullName} (${cleanPhone}) | Amount: ₹${finalGrandTotal}`);

    // 4. Initialize Razorpay Order / Checkout
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const isMock = !keyId || keyId.includes('mock') || !keySecret || keySecret.includes('mock');

    let razorpayOrderId: string | null = null;
    let mockCheckoutUrl: string | null = null;

    if (!isMock && keyId && keySecret) {
      try {
        const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const rzpOrder = await rzp.orders.create({
          amount: Math.round(finalGrandTotal * 100), // paise
          currency: 'INR',
          receipt: order.id.substring(0, 40),
          notes: {
            orderId: order.id,
            customerPhone: cleanPhone,
            customerName: fullName,
            campaignId: campaignId || '',
          },
        });
        razorpayOrderId = rzpOrder.id;
      } catch (rzpErr) {
        console.error('[Razorpay Order Creation Error]:', rzpErr);
      }
    } else {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      mockCheckoutUrl = `${appUrl}/checkout/mock?orderId=${order.id}&amount=${finalGrandTotal}&phone=${encodeURIComponent(cleanPhone)}`;
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: finalGrandTotal,
      currency: 'INR',
      keyId: keyId || 'rzp_live_Su2ksc11AHLPx1',
      razorpayOrderId,
      mockCheckoutUrl,
      customer: {
        name: fullName,
        phone: cleanPhone,
        email: email || '',
      },
    });
  } catch (error: any) {
    console.error('[API Checkout Create Order Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize checkout order' },
      { status: 500 }
    );
  }
}
