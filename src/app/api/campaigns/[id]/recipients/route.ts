import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const whereClause: any = {
      campaignId: id
    };

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause.customer = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { whatsappNumber: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    const [recipients, total] = await Promise.all([
      prisma.campaignRecipient.findMany({
        where: whereClause,
        include: {
          customer: {
            select: { name: true, whatsappNumber: true }
          }
        },
        orderBy: { sentAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.campaignRecipient.count({
        where: whereClause
      })
    ]);

    return NextResponse.json({
      recipients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }, { status: 200 });
  } catch (error: any) {
    console.error('[API Campaign Recipients GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
