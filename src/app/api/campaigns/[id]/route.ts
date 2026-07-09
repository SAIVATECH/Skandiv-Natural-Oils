import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { timestamp: 'desc' },
          take: 50
        },
        _count: {
          select: { recipients: true }
        },
        recipients: {
          select: { status: true }
        }
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const stats = {
      total: campaign._count.recipients,
      pending: 0,
      sending: 0,
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
      skipped: 0
    };

    campaign.recipients.forEach(r => {
      if (r.status === 'PENDING') stats.pending++;
      else if (r.status === 'SENDING') stats.sending++;
      else if (r.status === 'SENT') stats.sent++;
      else if (r.status === 'DELIVERED') stats.delivered++;
      else if (r.status === 'READ') stats.read++;
      else if (r.status === 'FAILED') stats.failed++;
      else if (r.status === 'SKIPPED') stats.skipped++;
    });

    return NextResponse.json({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      status: campaign.status,
      templateName: campaign.templateName,
      templateLanguage: campaign.templateLanguage,
      templateVariables: campaign.templateVariables,
      scheduledAt: campaign.scheduledAt,
      startedAt: campaign.startedAt,
      completedAt: campaign.completedAt,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      logs: campaign.logs,
      stats
    }, { status: 200 });
  } catch (error: any) {
    console.error('[API Campaign Get Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, templateName, templateLanguage, templateVariables, recipientIds, scheduledAt } = body;

    const existingCampaign = await prisma.campaign.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (existingCampaign.status !== 'DRAFT' && existingCampaign.status !== 'SCHEDULED') {
      return NextResponse.json({ error: 'Only draft or scheduled campaigns can be modified' }, { status: 400 });
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: {
        name,
        description,
        templateName,
        templateLanguage,
        templateVariables,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: scheduledAt ? 'SCHEDULED' : 'DRAFT'
      }
    });

    if (recipientIds && Array.isArray(recipientIds)) {
      // Re-assign recipients: delete old, create new
      await prisma.campaignRecipient.deleteMany({
        where: { campaignId: id }
      });

      if (recipientIds.length > 0) {
        const recipientData = recipientIds.map(custId => ({
          campaignId: id,
          customerId: custId,
          status: 'PENDING' as const
        }));
        await prisma.campaignRecipient.createMany({
          data: recipientData,
          skipDuplicates: true
        });
      }
    }

    try {
      await prisma.campaignAuditLog.create({
        data: {
          userId: 'admin-owner',
          action: 'CAMPAIGN_UPDATE',
          details: `Updated campaign: ${name} (ID: ${id})`
        }
      });
    } catch (e) {
      console.warn('Failed to write audit log:', e);
    }

    return NextResponse.json(updatedCampaign, { status: 200 });
  } catch (error: any) {
    console.error('[API Campaign Update Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { name: true, status: true }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status === 'SENDING') {
      return NextResponse.json({ error: 'Cannot delete an active sending campaign. Pause or cancel first.' }, { status: 400 });
    }

    await prisma.campaign.delete({
      where: { id }
    });

    try {
      await prisma.campaignAuditLog.create({
        data: {
          userId: 'admin-owner',
          action: 'CAMPAIGN_DELETE',
          details: `Deleted campaign: ${campaign.name} (ID: ${id})`
        }
      });
    } catch (e) {
      console.warn('Failed to write audit log:', e);
    }

    return NextResponse.json({ success: true, message: 'Campaign deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('[API Campaign Delete Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
