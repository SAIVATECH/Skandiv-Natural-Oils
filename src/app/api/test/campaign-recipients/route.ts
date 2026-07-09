import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Forbidden in production' }, { status: 403 });
  }

  try {
    const recipients = await prisma.campaignRecipient.findMany({
      where: {
        wamid: { not: null }
      },
      include: {
        customer: {
          select: { name: true, whatsappNumber: true }
        },
        campaign: {
          select: { name: true }
        }
      },
      orderBy: { sentAt: 'desc' },
      take: 15
    });

    return NextResponse.json(recipients, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Forbidden in production' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { wamid, status, phone, errorCode } = body;

    if (!wamid || !status || !phone) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Format Meta Webhook Payload
    const webhookPayload: any = {
      object: 'whatsapp_business_account',
      entry: [{
        id: 'waba_mock_id',
        changes: [{
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '16505553333',
              phone_number_id: '12345678'
            },
            statuses: [{
              id: wamid,
              status: status,
              recipient_id: phone,
              timestamp: Math.floor(Date.now() / 1000).toString()
            }]
          },
          field: 'messages'
        }]
      }]
    };

    // If simulating failure, add errors array
    if (status === 'failed') {
      webhookPayload.entry[0].changes[0].value.statuses[0].errors = [{
        code: errorCode || 131047,
        title: errorCode === 131026 ? 'Rate limit exceeded' : 'Re-engagement message error',
        message: 'Meta Cloud API Simulated webhook status update error.'
      }];
    }

    // Call local webhook POST endpoint
    const response = await fetch(`${appUrl}/api/webhooks/whatsapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookPayload)
    });

    if (!response.ok) {
      const txt = await response.text();
      return NextResponse.json({ error: `Webhook endpoint returned ${response.status}: ${txt}` }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
