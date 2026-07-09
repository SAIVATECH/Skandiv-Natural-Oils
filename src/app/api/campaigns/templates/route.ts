import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchMetaTemplates } from '@/lib/whatsapp';

export async function GET() {
  try {
    const templates = await prisma.campaignTemplate.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(templates, { status: 200 });
  } catch (error: any) {
    console.error('[API Campaign Templates GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const metaTemplates = await fetchMetaTemplates();

    // Sync into the DB
    for (const t of metaTemplates) {
      await prisma.campaignTemplate.upsert({
        where: { name: t.name },
        create: {
          id: t.id || `tmpl_${Math.random().toString(36).substring(2, 9)}`,
          name: t.name,
          language: t.language || 'en',
          category: t.category || 'UTILITY',
          status: t.status || 'APPROVED',
          components: t.components || []
        },
        update: {
          language: t.language || 'en',
          category: t.category || 'UTILITY',
          status: t.status || 'APPROVED',
          components: t.components || [],
          lastSyncedAt: new Date()
        }
      });
    }

    // Delete old cached templates that are no longer returned by the Meta API (including any mock templates)
    const fetchedNames = metaTemplates.map((t: any) => t.name);
    await prisma.campaignTemplate.deleteMany({
      where: {
        name: { notIn: fetchedNames }
      }
    });

    const synced = await prisma.campaignTemplate.findMany({
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ success: true, count: metaTemplates.length, templates: synced }, { status: 200 });
  } catch (error: any) {
    console.error('[API Campaign Templates POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
