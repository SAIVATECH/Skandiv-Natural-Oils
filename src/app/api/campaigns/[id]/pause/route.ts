import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const campaign = await prisma.campaign.findUnique({
      where: { id }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status !== 'SENDING') {
      return NextResponse.json({ error: 'Only active sending campaigns can be paused' }, { status: 400 });
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: { status: 'PAUSED' }
    });

    await prisma.campaignLog.create({
      data: {
        campaignId: id,
        level: 'INFO',
        message: 'Campaign paused by administrator.'
      }
    });

    try {
      await prisma.campaignAuditLog.create({
        data: {
          userId: 'admin-owner',
          action: 'CAMPAIGN_PAUSE',
          details: `Paused campaign: ${campaign.name} (ID: ${id})`
        }
      });
    } catch (e) {
      console.warn('Failed to write audit log:', e);
    }

    return NextResponse.json({ success: true, campaign: updated }, { status: 200 });
  } catch (error: any) {
    console.error('[API Campaign Pause Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
