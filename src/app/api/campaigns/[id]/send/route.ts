import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processCampaignBatch } from '@/services/campaign-processor';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        _count: {
          select: { recipients: { where: { status: 'PENDING' } } }
        }
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status === 'COMPLETED' || campaign.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Cannot send a completed or cancelled campaign' }, { status: 400 });
    }

    if (campaign._count.recipients === 0) {
      return NextResponse.json({ error: 'No pending recipients left in this campaign' }, { status: 400 });
    }

    // Set status to SENDING
    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        status: 'SENDING',
        startedAt: campaign.startedAt || new Date()
      }
    });

    // Start background processing (synchronous batch of 5)
    const batchResult = await processCampaignBatch(id, 5);

    try {
      await prisma.campaignAuditLog.create({
        data: {
          userId: 'admin-owner',
          action: 'CAMPAIGN_SEND',
          details: `Dispatched campaign sending for: ${campaign.name} (ID: ${id})`
        }
      });
    } catch (e) {
      console.warn('Failed to write audit log:', e);
    }

    return NextResponse.json({ success: true, campaign: updated, hasMore: batchResult.hasMore }, { status: 200 });
  } catch (error: any) {
    console.error('[API Campaign Send Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
