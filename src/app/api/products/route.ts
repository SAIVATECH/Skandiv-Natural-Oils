import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { productSchema } from '@/validations/schemas';

/**
 * GET all products
 * Path: GET /api/products
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const whereClause: any = {};

    if (category) {
      whereClause.category = category;
    }

    if (activeOnly) {
      whereClause.isActive = true;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('[API Products GET Error]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * POST Create new product
 * Path: POST /api/products
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate inputs
    const validatedData = productSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { errors: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existingSlug = await prisma.product.findUnique({
      where: { slug: validatedData.data.slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { errors: { slug: ['This product slug is already in use'] } },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: validatedData.data,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('[API Products POST Error]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
