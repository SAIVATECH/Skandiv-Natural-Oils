import { prisma } from '@/lib/prisma';
import { sendWhatsAppTemplateMessage } from '@/lib/whatsapp';

/**
 * Helper to map template variables configuration to Meta Cloud API components format.
 */
function mapTemplateVariables(varsConfig: any, customer: any): any[] {
  const bodyParams: any[] = [];
  const headerParams: any[] = [];

  if (varsConfig && Array.isArray(varsConfig.body)) {
    varsConfig.body.forEach((v: any) => {
      let text = '';
      if (v.type === 'customer_name') {
        text = customer.name || 'Valued Customer';
      } else if (v.type === 'customer_phone') {
        text = customer.whatsappNumber;
      } else {
        text = v.value || '';
      }
      bodyParams.push({ type: 'text', text });
    });
  }

  if (varsConfig && Array.isArray(varsConfig.header)) {
    varsConfig.header.forEach((v: any) => {
      let text = '';
      if (v.type === 'customer_name') {
        text = customer.name || 'Valued Customer';
      } else {
        text = v.value || '';
      }
      headerParams.push({ type: 'text', text });
    });
  }

  const components: any[] = [];
  if (bodyParams.length > 0) {
    components.push({ type: 'body', parameters: bodyParams });
  }
  if (headerParams.length > 0) {
    components.push({ type: 'header', parameters: headerParams });
  }
  return components;
}

/**
 * Processes a batch of campaign messages synchronously.
 * Ideal for serverless environments (like Vercel) where background promises are terminated.
 * Returns how many were processed in this batch and if there are more pending.
 */
export async function processCampaignBatch(campaignId: string, batchSize: number = 5): Promise<{ processedCount: number; hasMore: boolean }> {
  console.log(`[Campaign Processor] Processing batch for Campaign ID: ${campaignId} (size: ${batchSize})`);
  
  try {
    // 1. Fetch Campaign Details along with a limited subset of pending recipients
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        recipients: {
          where: { status: 'PENDING' },
          include: { customer: true },
          take: batchSize
        }
      }
    });

    if (!campaign) {
      console.error(`[Campaign Processor] Campaign not found: ${campaignId}`);
      return { processedCount: 0, hasMore: false };
    }

    // Set status to SENDING if it isn't already
    if (campaign.status !== 'SENDING') {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: 'SENDING', startedAt: campaign.startedAt || new Date() }
      });
    }

    if (campaign.recipients.length === 0) {
      // Check if there are any pending or sending recipients left in the entire campaign
      const totalPending = await prisma.campaignRecipient.count({
        where: { campaignId, status: 'PENDING' }
      });
      const totalSending = await prisma.campaignRecipient.count({
        where: { campaignId, status: 'SENDING' }
      });
      
      if (totalPending === 0 && totalSending === 0) {
        await prisma.campaign.update({
          where: { id: campaignId },
          data: { status: 'COMPLETED', completedAt: new Date() }
        });
        await prisma.campaignLog.create({
          data: {
            campaignId,
            level: 'INFO',
            message: 'Campaign completed successfully. All recipients processed.'
          }
        });
        return { processedCount: 0, hasMore: false };
      }
      
      return { processedCount: 0, hasMore: totalPending > 0 };
    }

    // Log start of batch processing
    await prisma.campaignLog.create({
      data: {
        campaignId,
        level: 'INFO',
        message: `Processing batch of ${campaign.recipients.length} recipients.`
      }
    });

    // 2. Fetch Settings
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

    const delayMs = Math.max(100, Math.floor((60 / settings.campaignRateLimitPerMin) * 1000));
    const dailyCap = settings.dailyCap;
    const monthlyCap = settings.monthlyCap;

    let processedCount = 0;

    // 3. Loop recipients and dispatch
    for (const recipient of campaign.recipients) {
      // Double check status to prevent duplicate sends
      const freshRecipient = await prisma.campaignRecipient.findUnique({
        where: { id: recipient.id },
        select: { status: true }
      });

      if (freshRecipient?.status !== 'PENDING') {
        console.log(`[Campaign Processor] Recipient ${recipient.id} already processed. Skipping.`);
        continue;
      }

      // Check safety limits
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Count messages sent today
      const sentTodayCount = await prisma.campaignRecipient.count({
        where: {
          status: { in: ['SENT', 'DELIVERED', 'READ'] },
          sentAt: { gte: startOfDay }
        }
      });

      if (sentTodayCount >= dailyCap) {
        console.warn(`[Campaign Processor] Daily cap of ${dailyCap} reached. Suspending campaign.`);
        await prisma.campaign.update({
          where: { id: campaignId },
          data: { status: 'PAUSED' }
        });
        await prisma.campaignLog.create({
          data: {
            campaignId,
            level: 'WARN',
            message: `Daily message threshold cap (${dailyCap}) reached. Campaign paused.`
          }
        });
        return { processedCount, hasMore: false };
      }

      // Count messages sent this month
      const sentThisMonthCount = await prisma.campaignRecipient.count({
        where: {
          status: { in: ['SENT', 'DELIVERED', 'READ'] },
          sentAt: { gte: startOfMonth }
        }
      });

      if (sentThisMonthCount >= monthlyCap) {
        console.warn(`[Campaign Processor] Monthly cap of ${monthlyCap} reached. Suspending campaign.`);
        await prisma.campaign.update({
          where: { id: campaignId },
          data: { status: 'PAUSED' }
        });
        await prisma.campaignLog.create({
          data: {
            campaignId,
            level: 'WARN',
            message: `Monthly message threshold cap (${monthlyCap}) reached. Campaign paused.`
          }
        });
        return { processedCount, hasMore: false };
      }

      // Map variables
      const components = mapTemplateVariables(campaign.templateVariables, recipient.customer);

      // Mark recipient status as SENDING
      await prisma.campaignRecipient.update({
        where: { id: recipient.id },
        data: { status: 'SENDING' }
      });

      try {
        // Send WhatsApp template message
        const response = await sendWhatsAppTemplateMessage(
          recipient.customer.whatsappNumber,
          campaign.templateName,
          campaign.templateLanguage,
          components
        );

        if (response.error) {
          // Failed transmission
          await prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: {
              status: 'FAILED',
              failedAt: new Date(),
              errorMessage: response.error
            }
          });
          await prisma.campaignLog.create({
            data: {
              campaignId,
              level: 'ERROR',
              message: `Failed to send to +${recipient.customer.whatsappNumber}: ${response.error}`
            }
          });
        } else {
          // Successful transmission
          await prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: {
              status: 'SENT',
              sentAt: new Date(),
              wamid: response.id,
              variables: components,
              cost: 0.015 // Mock cost in USD per marketing message
            }
          });
        }
      } catch (sendErr: any) {
        // Catch exceptions
        await prisma.campaignRecipient.update({
          where: { id: recipient.id },
          data: {
            status: 'FAILED',
            failedAt: new Date(),
            errorMessage: sendErr.message || String(sendErr)
          }
        });
        await prisma.campaignLog.create({
          data: {
            campaignId,
            level: 'ERROR',
            message: `Unhandled sending error for +${recipient.customer.whatsappNumber}: ${sendErr.message || String(sendErr)}`
          }
        });
      }

      processedCount++;

      // Apply rate limiting delay (only if not the last item in the batch)
      if (processedCount < campaign.recipients.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    // Check if there are any remaining pending recipients left in the entire campaign
    const remainingPending = await prisma.campaignRecipient.count({
      where: { campaignId, status: 'PENDING' }
    });

    const remainingSending = await prisma.campaignRecipient.count({
      where: { campaignId, status: 'SENDING' }
    });

    if (remainingPending === 0 && remainingSending === 0) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: 'COMPLETED', completedAt: new Date() }
      });
      await prisma.campaignLog.create({
        data: {
          campaignId,
          level: 'INFO',
          message: 'Campaign completed successfully. All recipients processed.'
        }
      });
      return { processedCount, hasMore: false };
    }

    return { processedCount, hasMore: remainingPending > 0 };
  } catch (error: any) {
    console.error('[Campaign Processor Error] Fatal processing failure:', error);
    try {
      await prisma.campaignLog.create({
        data: {
          campaignId,
          level: 'ERROR',
          message: `Fatal processor crash: ${error.message || String(error)}`
        }
      });
    } catch (logErr) {
      console.error('Failed to log processor crash to DB:', logErr);
    }
    return { processedCount: 0, hasMore: false };
  }
}
