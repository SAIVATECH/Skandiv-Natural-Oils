import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const totalCampaigns = await prisma.campaign.count();
    
    // Status counts across all campaign recipients
    const recipientStatusCounts = await prisma.campaignRecipient.groupBy({
      by: ['status'],
      _count: true
    });

    const statusTotals = {
      pending: 0,
      sending: 0,
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
      skipped: 0
    };

    recipientStatusCounts.forEach((item: any) => {
      const s = item.status.toLowerCase();
      if (s in statusTotals) {
        (statusTotals as any)[s] = item._count;
      }
    });

    const totalProcessed = Object.values(statusTotals).reduce((a, b) => a + b, 0);
    const sentCount = statusTotals.sent + statusTotals.delivered + statusTotals.read;
    const deliveredCount = statusTotals.delivered + statusTotals.read;
    const readCount = statusTotals.read;

    const deliveryRate = sentCount > 0 ? (deliveredCount / sentCount) * 100 : 0;
    const openRate = deliveredCount > 0 ? (readCount / deliveredCount) * 100 : 0;

    // Total cost
    const costAgg = await prisma.campaignRecipient.aggregate({
      _sum: { cost: true }
    });
    const totalCost = Number(costAgg._sum.cost || 0);

    // Sync Settings Limits
    let settings = await prisma.campaignSettings.findUnique({
      where: { id: 'global' }
    });
    if (!settings) {
      settings = {
        id: 'global',
        dailyCap: 1000,
        monthlyCap: 30000,
        campaignRateLimitPerMin: 60,
        updatedAt: new Date()
      };
    }

    // Daily & Monthly Sent
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const sentToday = await prisma.campaignRecipient.count({
      where: {
        status: { in: ['SENT', 'DELIVERED', 'READ'] },
        sentAt: { gte: startOfDay }
      }
    });

    const sentThisMonth = await prisma.campaignRecipient.count({
      where: {
        status: { in: ['SENT', 'DELIVERED', 'READ'] },
        sentAt: { gte: startOfMonth }
      }
    });

    // Funnel Data (Total -> Sent -> Delivered -> Read)
    const funnelData = [
      { name: 'Targeted', value: totalProcessed },
      { name: 'Sent', value: sentCount },
      { name: 'Delivered', value: deliveredCount },
      { name: 'Read (Opened)', value: readCount }
    ];

    // Template efficiency: Count of campaigns using templates
    const templatesUsage = await prisma.campaign.groupBy({
      by: ['templateName'],
      _count: true
    });
    const templateData = templatesUsage.map((t: any) => ({
      name: t.templateName,
      value: t._count
    }));

    // Dispatch trends: last 7 days sending trends
    const dispatchTrends: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await prisma.campaignRecipient.count({
        where: {
          status: { in: ['SENT', 'DELIVERED', 'READ'] },
          sentAt: { gte: date, lt: nextDate }
        }
      });

      dispatchTrends.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        dispatched: count
      });
    }

    // Latest audit logs
    const auditLogs = await prisma.campaignAuditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10
    });

    return NextResponse.json({
      cards: {
        totalCampaigns,
        totalProcessed,
        sentCount,
        deliveredCount,
        readCount,
        deliveryRate,
        openRate,
        totalCost,
        dailyCap: settings.dailyCap,
        monthlyCap: settings.monthlyCap,
        sentToday,
        sentThisMonth
      },
      funnelData,
      templateData,
      dispatchTrends,
      auditLogs
    }, { status: 200 });
  } catch (error: any) {
    console.error('[API Campaign Analytics GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
