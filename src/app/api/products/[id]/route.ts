import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { productSchema } from '@/validations/schemas';

/**
 * PUT Update product
 * Path: PUT /api/products/[id]
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Validate inputs
    const validatedData = productSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { errors: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return new NextResponse('Product not found', { status: 404 });
    }

    // Verify slug uniqueness if slug has changed
    if (validatedData.data.slug !== product.slug) {
      const existingSlug = await prisma.product.findUnique({
        where: { slug: validatedData.data.slug },
      });

      if (existingSlug) {
        return NextResponse.json(
          { errors: { slug: ['This product slug is already in use'] } },
          { status: 400 }
        );
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: validatedData.data,
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('[API Product PUT Error]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * DELETE product
 * Path: DELETE /api/products/[id]
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return new NextResponse('Product not found', { status: 404 });
    }

    // Check if the product has historical sales to protect relational database integrity
    const itemsCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (itemsCount > 0) {
      // Instead of hard deleting, we soft-deactivate historical items to preserve financial ledgers!
      const deactivatedProduct = await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({
        message: 'Product contains historical orders. Soft-deactivated instead of deleted.',
        product: deactivatedProduct,
      });
    }

    await prisma.product.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[API Product DELETE Error]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
