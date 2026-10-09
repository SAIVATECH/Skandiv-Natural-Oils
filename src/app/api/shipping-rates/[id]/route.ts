import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const shippingRateUpdateSchema = z.object({
  zoneName: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  pincodePrefixes: z.string().optional().nullable(),
  deliveryFee: z.number().nonnegative().optional(),
  estimatedDays: z.string().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET Single Shipping Rate
 * Path: GET /api/shipping-rates/[id]
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rate = await (prisma as any).shippingRate.findUnique({
      where: { id },
    });

    if (!rate) {
      return NextResponse.json({ error: 'Shipping rate not found' }, { status: 404 });
    }

    return NextResponse.json(rate);
  } catch (error: any) {
    console.error('[API ShippingRate GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch shipping rate' }, { status: 500 });
  }
}

/**
 * PUT Update Shipping Rate (Admin)
 * Path: PUT /api/shipping-rates/[id]
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const validation = shippingRateUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid shipping rate parameters', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const dataToUpdate: any = { ...validation.data };
    if (dataToUpdate.zoneName) dataToUpdate.zoneName = dataToUpdate.zoneName.trim();
    if (dataToUpdate.state) dataToUpdate.state = dataToUpdate.state.trim();
    if (dataToUpdate.pincodePrefixes !== undefined) {
      dataToUpdate.pincodePrefixes = dataToUpdate.pincodePrefixes ? dataToUpdate.pincodePrefixes.trim() : null;
    }

    if (dataToUpdate.isDefault) {
      try {
        await (prisma as any).shippingRate.updateMany({
          where: { isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      } catch (err) {
        console.warn('Could not reset other default rates:', err);
      }
    }

    const updated = await (prisma as any).shippingRate.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[API ShippingRate PUT Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to update shipping rate' }, { status: 500 });
  }
}

/**
 * DELETE Shipping Rate (Admin)
 * Path: DELETE /api/shipping-rates/[id]
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await (prisma as any).shippingRate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Shipping rate deleted successfully' });
  } catch (error: any) {
    console.error('[API ShippingRate DELETE Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete shipping rate' }, { status: 500 });
  }
}
