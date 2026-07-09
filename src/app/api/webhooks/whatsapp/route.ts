import { NextResponse } from 'next/server';
import { handleWhatsAppMessage } from '@/services/whatsapp-state';
import { handleWhatsAppDeliveryError } from '@/lib/whatsapp';
import { prisma } from '@/lib/prisma';

/**
 * GET Handler for Meta Webhook Verification (Handshake).
 * Meta requires this endpoint to verify webhook authenticity by matching the custom verify token.
 * 
 * Path: GET /api/webhooks/whatsapp
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'mock_verify_token_secure123';

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('[Meta Webhook] GET Handshake successful! Webhook verified.');
      return new NextResponse(challenge, { status: 200 });
    } else {
      console.warn('[Meta Webhook] GET Handshake failed. Verification token mismatch.');
      return new NextResponse('Forbidden', { status: 403 });
    }
  } catch (error) {
    console.error('[Meta Webhook Verification Error]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * POST Handler for Incoming Meta WhatsApp Messages.
 * Processes customer replies, text, quick-reply buttons, and updates the conversational state machine.
 * 
 * Path: POST /api/webhooks/whatsapp
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log('[Meta Webhook Received] POST Request JSON:', JSON.stringify(body, null, 2));

    // Meta Webhook sends status updates (e.g., sent, delivered, read) as well as messages.
    // We process both message events and status updates.
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];
    const statuses = value?.statuses;

    // Handle delivery status updates (including failures)
    if (statuses && statuses.length > 0) {
      for (const status of statuses) {
        const { id, status: deliveryStatus, recipient_id, errors } = status;
        
        if (errors && errors.length > 0) {
          for (const error of errors) {
            const errorInfo = handleWhatsAppDeliveryError(
              error.code,
              error.title,
              error.error_data
            );
            
            console.error(
              `[WhatsApp Delivery Error] Code: ${error.code} | Recipient: ${recipient_id} | ` +
              `Title: ${error.title} | Message: ${error.message}\n` +
              `Action: ${errorInfo.recommendedAction}\n` +
              `Retryable: ${errorInfo.isRetryable}`
            );

            // Special handling for re-engagement message error
            if (error.code === 131047) {
              console.error(
                `[24-Hour Rule Violation] Cannot send message to ${recipient_id}. ` +
                `Details: ${error.error_data?.details || 'Not provided'}`
              );
            }
          }
        } else {
          console.log(`[Meta Webhook Status] Message ID: ${id}, Recipient: ${recipient_id}, Status: ${deliveryStatus}`);
        }

        // Sync CampaignRecipient delivery status in the database
        try {
          const campaignRecipient = await prisma.campaignRecipient.findUnique({
            where: { wamid: id }
          });

          if (campaignRecipient) {
            const mappedStatus = deliveryStatus.toUpperCase() as any;
            const updateData: any = { status: mappedStatus };

            if (deliveryStatus === 'sent') {
              updateData.sentAt = new Date();
            } else if (deliveryStatus === 'delivered') {
              updateData.deliveredAt = new Date();
            } else if (deliveryStatus === 'read') {
              updateData.readAt = new Date();
              if (!campaignRecipient.deliveredAt) {
                updateData.deliveredAt = new Date();
              }
            } else if (deliveryStatus === 'failed') {
              updateData.failedAt = new Date();
              if (errors && errors.length > 0) {
                updateData.errorMessage = errors[0].message || errors[0].title || 'Unknown Meta API error';
              }
            }

            await prisma.campaignRecipient.update({
              where: { id: campaignRecipient.id },
              data: updateData
            });

            console.log(`[Campaign Webhook Sync] Updated recipient ${campaignRecipient.id} (Wamid: ${id}) to status: ${mappedStatus}`);
          }
        } catch (dbErr) {
          console.error('[Campaign Webhook Sync Error] Failed to update recipient status:', dbErr);
        }
      }
      
      // Acknowledge receipt - we don't need to process status updates further
      return new NextResponse('OK', { status: 200 });
    }

    if (!message) {
      // If it's another event type, return 200 immediately to acknowledge
      return new NextResponse('OK', { status: 200 });
    }

    const from = message.from; // Customer's phone number (digits only, e.g. "919876543210")
    let textBody = '';

    // Handle different message types from Meta API
    if (message.type === 'text') {
      textBody = message.text?.body || '';
    } else if (message.type === 'button') {
      textBody = message.button?.text || '';
    } else if (message.type === 'interactive') {
      const interactive = message.interactive;
      if (interactive?.type === 'button_reply') {
        textBody = interactive.button_reply?.id || interactive.button_reply?.title || '';
      } else if (interactive?.type === 'list_reply') {
        textBody = interactive.list_reply?.id || '';
      }
    }

    console.log(`[Meta Webhook Event] Sender: ${from}, Extracted Content: "${textBody}"`);

    if (!from || !textBody) {
      return new NextResponse('OK', { status: 200 });
    }

    // Await state machine execution to ensure database queries complete and connections
    // are cleanly released before Vercel suspends the serverless execution context.
    try {
      await handleWhatsAppMessage(from, textBody);
    } catch (err) {
      console.error('[Meta Webhook Error] State machine failed:', err);
    }

    return new NextResponse('EVENT_RECEIVED', { status: 200 });
  } catch (error) {
    console.error('[Meta Webhook POST Error] Failed to process incoming request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
