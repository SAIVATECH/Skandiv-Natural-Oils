import { NextResponse } from 'next/server';
import { handleWhatsAppMessage } from '@/services/whatsapp-state';
import { getSimulatorLogs } from '@/lib/simulator-store';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Forbidden in production environment' }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    let userState = null;
    if (phone) {
      const cleanPhone = phone.replace(/^whatsapp:/i, '').replace(/\D/g, '');
      const user = await prisma.user.findUnique({
        where: { whatsappNumber: cleanPhone },
        include: { state: true }
      });
      userState = user?.state || null;
    }

    const logs = await getSimulatorLogs(phone || undefined);
    return NextResponse.json({
      logs: logs,
      state: userState
    }, { status: 200 });
  } catch (error: any) {
    console.error('[Simulator API GET Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Forbidden in production environment' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { phone, text } = body;

    if (!phone || !text) {
      return NextResponse.json({ error: 'Missing phone or text parameter' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/^whatsapp:/i, '').replace(/\D/g, '');

    // Execute state machine step
    await handleWhatsAppMessage(cleanPhone, text);

    // Fetch updated state
    const user = await prisma.user.findUnique({
      where: { whatsappNumber: cleanPhone },
      include: { state: true }
    });

    const logs = await getSimulatorLogs(phone || undefined);
    return NextResponse.json({
      success: true,
      logs: logs,
      state: user?.state || null
    }, { status: 200 });
  } catch (error: any) {
    console.error('[Simulator API POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Forbidden in production environment' }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ error: 'Missing phone parameter' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/^whatsapp:/i, '').replace(/\D/g, '');

    // Reset customer state & discard previous pending/processing orders for a clean baseline
    const user = await prisma.user.findUnique({
      where: { whatsappNumber: cleanPhone }
    });

    if (user) {
      await prisma.conversationState.deleteMany({ where: { userId: user.id } });
      await prisma.order.deleteMany({ where: { userId: user.id } });
      await (prisma as any).messageLog.deleteMany({ where: { phone: cleanPhone } });
      
      // Create a fresh clean starting state
      await prisma.conversationState.create({
        data: {
          userId: user.id,
          currentStep: 'START'
        }
      });
      
      console.log(`[Simulator API] Cleaned up state, message logs, and orders for test customer +${cleanPhone}`);
    }

    const logs = await getSimulatorLogs(phone || undefined);
    return NextResponse.json({
      success: true,
      message: 'State machine reset successfully.',
      logs: logs
    }, { status: 200 });
  } catch (error: any) {
    console.error('[Simulator API DELETE Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
