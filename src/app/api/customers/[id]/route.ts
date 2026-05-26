import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
