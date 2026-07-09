import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let settings = await prisma.campaignSettings.findUnique({
      where: { id: 'global' }
    });

    if (!settings) {
      settings = await prisma.campaignSettings.create({
        data: {
          id: 'global',
          dailyCap: 1000,
          monthlyCap: 30000,
          campaignRateLimitPerMin: 60
        }
      });
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error: any) {
    console.error('[API Campaign Settings GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { dailyCap, monthlyCap, campaignRateLimitPerMin } = body;

    const settings = await prisma.campaignSettings.upsert({
      where: { id: 'global' },
      create: {
        id: 'global',
        dailyCap: dailyCap !== undefined ? parseInt(dailyCap) : 1000,
        monthlyCap: monthlyCap !== undefined ? parseInt(monthlyCap) : 30000,
        campaignRateLimitPerMin: campaignRateLimitPerMin !== undefined ? parseInt(campaignRateLimitPerMin) : 60
      },
      update: {
        dailyCap: dailyCap !== undefined ? parseInt(dailyCap) : undefined,
        monthlyCap: monthlyCap !== undefined ? parseInt(monthlyCap) : undefined,
        campaignRateLimitPerMin: campaignRateLimitPerMin !== undefined ? parseInt(campaignRateLimitPerMin) : undefined
      }
    });

    try {
      await prisma.campaignAuditLog.create({
        data: {
          userId: 'admin-owner',
          action: 'SETTINGS_UPDATE',
          details: `Updated campaign settings: dailyCap=${settings.dailyCap}, monthlyCap=${settings.monthlyCap}, rateLimit=${settings.campaignRateLimitPerMin}`
        }
      });
    } catch (e) {
      console.warn('Failed to write audit log:', e);
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error: any) {
    console.error('[API Campaign Settings PUT Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
