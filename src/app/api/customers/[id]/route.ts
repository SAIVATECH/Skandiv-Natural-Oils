import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { customerSchema } from '@/validations/schemas';

/**
 * DELETE Customer from the database
 * Path: DELETE /api/customers/[id]
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return new NextResponse('Customer not found', { status: 404 });
    }

    // Safeguard to prevent deleting administrator roles
    if (user.role === 'ADMIN') {
      return new NextResponse('Cannot delete administrator accounts', { status: 403 });
    }

    // Direct deletion - cascade takes care of ConversationState, Orders, Items, Payments
    await prisma.user.delete({
      where: { id },
    });

    console.log(`[API Customer DELETE] Customer ${id} successfully deleted.`);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[API Customer DELETE Error]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * PUT update customer details
 * Path: PUT /api/customers/[id]
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return new NextResponse('Customer not found', { status: 404 });
    }

    if (user.role === 'ADMIN') {
      return new NextResponse('Cannot update administrator accounts', { status: 403 });
    }

    // Check if the new WhatsApp number is already in use by another user
    if (whatsappNumber !== user.whatsappNumber) {
      const existing = await prisma.user.findUnique({
        where: { whatsappNumber },
      });
      if (existing) {
        return NextResponse.json(
          { errors: { whatsappNumber: ['WhatsApp number is already in use'] } },
          { status: 400 }
        );
      }
    }

    // Update Customer details
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        whatsappNumber,
      },
    });

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      whatsappNumber: updatedUser.whatsappNumber,
    });
  } catch (error: any) {
    console.error('[API Customer PUT Error]:', error);
    return NextResponse.json(
      { errors: { global: [error.message || 'Internal Server Error'] } },
      { status: 500 }
    );
  }
}
