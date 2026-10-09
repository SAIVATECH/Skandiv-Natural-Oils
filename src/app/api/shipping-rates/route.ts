import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const shippingRateCreateSchema = z.object({
  zoneName: z.string().min(2, 'Zone name is required'),
  state: z.string().min(2, 'State or region is required'),
  pincodePrefixes: z.string().optional().nullable(),
  deliveryFee: z.number().nonnegative('Delivery fee cannot be negative'),
  estimatedDays: z.string().default('2-4 Business Days'),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const DEFAULT_SHIPPING_RATES = [
  {
    id: 'rate-tn',
    zoneName: 'Tamil Nadu (Local Home Delivery)',
    state: 'Tamil Nadu, Puducherry',
    pincodePrefixes: '600,601,602,603,604,605,620,621,622,624,625,626,627,628,629,630,631,632,635,636,637,638,641,642,643',
    deliveryFee: 30,
    estimatedDays: '1-2 Business Days',
    isDefault: false,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'rate-south',
    zoneName: 'South India Region',
    state: 'Kerala, Karnataka, Andhra Pradesh, Telangana',
    pincodePrefixes: '500,501,502,503,504,505,506,507,508,509,515,516,517,518,520,521,522,523,524,530,531,532,533,534,535,560,570,571,572,573,574,575,576,577,580,581,582,583,584,585,586,587,590,591,670,671,673,676,678,679,680,682,683,685,686,688,689,690,691,695',
    deliveryFee: 45,
    estimatedDays: '2-3 Business Days',
    isDefault: false,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'rate-rest-india',
    zoneName: 'Rest of India (Metro & Major States)',
    state: 'Maharashtra, Delhi, Gujarat, Rajasthan, Uttar Pradesh, West Bengal, Punjab, Haryana, Madhya Pradesh, Bihar, Odisha, Goa, Chandigarh',
    pincodePrefixes: null,
    deliveryFee: 60,
    estimatedDays: '3-5 Business Days',
    isDefault: false,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'rate-special',
    zoneName: 'North East, J&K & Remote Regions',
    state: 'Assam, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, Arunachal Pradesh, Sikkim, Jammu and Kashmir, Ladakh, Andaman and Nicobar Islands, Lakshadweep, Himachal Pradesh, Uttarakhand',
    pincodePrefixes: null,
    deliveryFee: 80,
    estimatedDays: '4-7 Business Days',
    isDefault: false,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'rate-default',
    zoneName: 'Default Standard Delivery (Pan-India)',
    state: 'All Other Locations',
    pincodePrefixes: null,
    deliveryFee: 49,
    estimatedDays: '2-4 Business Days',
    isDefault: true,
    isActive: true,
    createdAt: new Date(),
  },
];

/**
 * GET all shipping rates
 * Path: GET /api/shipping-rates
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    try {
      const rates = await (prisma as any).shippingRate.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: [{ isDefault: 'asc' }, { createdAt: 'desc' }],
      });

      if (rates && rates.length > 0) {
        return NextResponse.json(rates);
      }
      return NextResponse.json(activeOnly ? DEFAULT_SHIPPING_RATES.filter(r => r.isActive) : DEFAULT_SHIPPING_RATES);
    } catch (dbErr) {
      console.warn('[ShippingRates GET Warning] Falling back to default location rates:', dbErr);
      return NextResponse.json(activeOnly ? DEFAULT_SHIPPING_RATES.filter(r => r.isActive) : DEFAULT_SHIPPING_RATES);
    }
  } catch (error: any) {
    console.error('[API ShippingRates GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch shipping rates' }, { status: 500 });
  }
}

/**
 * POST create a new location shipping rate (Admin)
 * Path: POST /api/shipping-rates
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = shippingRateCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid shipping rate parameters', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      zoneName,
      state,
      pincodePrefixes,
      deliveryFee,
      estimatedDays,
      isDefault,
      isActive,
    } = validation.data;

    // If setting this rate as default, remove isDefault from other rates
    if (isDefault) {
      try {
        await (prisma as any).shippingRate.updateMany({
          where: { isDefault: true },
          data: { isDefault: false },
        });
      } catch (err) {
        console.warn('Could not reset existing default rate:', err);
      }
    }

    const newRate = await (prisma as any).shippingRate.create({
      data: {
        zoneName: zoneName.trim(),
        state: state.trim(),
        pincodePrefixes: pincodePrefixes?.trim() || null,
        deliveryFee,
        estimatedDays: estimatedDays.trim(),
        isDefault,
        isActive,
      },
    });

    return NextResponse.json(newRate, { status: 201 });
  } catch (error: any) {
    console.error('[API ShippingRates POST Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create shipping rate' },
      { status: 500 }
    );
  }
}
