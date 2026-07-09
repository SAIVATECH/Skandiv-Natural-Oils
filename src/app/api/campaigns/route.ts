import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { recipients: true }
        },
        recipients: {
          select: { status: true }
        }
      }
    });

    const formattedCampaigns = campaigns.map(c => {
      const stats = {
        total: c._count.recipients,
        pending: 0,
        sending: 0,
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        skipped: 0
      };

      c.recipients.forEach(r => {
        if (r.status === 'PENDING') stats.pending++;
        else if (r.status === 'SENDING') stats.sending++;
        else if (r.status === 'SENT') stats.sent++;
        else if (r.status === 'DELIVERED') stats.delivered++;
        else if (r.status === 'READ') stats.read++;
        else if (r.status === 'FAILED') stats.failed++;
        else if (r.status === 'SKIPPED') stats.skipped++;
      });

      return {
        id: c.id,
        name: c.name,
        description: c.description,
        status: c.status,
        templateName: c.templateName,
        templateLanguage: c.templateLanguage,
        templateVariables: c.templateVariables,
        scheduledAt: c.scheduledAt,
        startedAt: c.startedAt,
        completedAt: c.completedAt,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        stats
      };
    });

    return NextResponse.json(formattedCampaigns, { status: 200 });
  } catch (error: any) {
    console.error('[API Campaigns GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, templateName, templateLanguage, templateVariables, recipientIds, scheduledAt } = body;

    if (!name || !templateName || !templateLanguage || !templateVariables) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
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

    if (recipientIds && Array.isArray(recipientIds) && recipientIds.length > 0) {
      const recipientData = recipientIds.map(id => ({
        campaignId: campaign.id,
        customerId: id,
        status: 'PENDING' as const
      }));

      await prisma.campaignRecipient.createMany({
        data: recipientData,
        skipDuplicates: true
      });
    }

    // Add Audit Log
    try {
      await prisma.campaignAuditLog.create({
        data: {
          userId: 'admin-owner', // Default system fallback identifier
          action: 'CAMPAIGN_CREATE',
          details: `Created campaign: ${name} (ID: ${campaign.id})`
        }
      });
    } catch (e) {
      console.warn('Failed to write audit log:', e);
    }

    return NextResponse.json(campaign, { status: 201 });
  } catch (error: any) {
    console.error('[API Campaigns POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
