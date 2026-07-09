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
 * Starts the campaign sending process in the background.
 * Returns immediately, leaving the sending worker running asynchronously.
 */
export function startCampaignProcessor(campaignId: string) {
  // Execute async processing loop without blocking the caller
  (async () => {
    console.log(`[Campaign Processor] Starting background worker for Campaign ID: ${campaignId}`);
    
    try {
      // 1. Fetch Campaign Details
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
          recipients: {
            where: { status: 'PENDING' },
            include: { customer: true }
          }
        }
      });

      if (!campaign) {
        console.error(`[Campaign Processor] Campaign not found: ${campaignId}`);
        return;
      }

      if (campaign.status !== 'SENDING') {
        // Set to SENDING if it isn't already
        await prisma.campaign.update({
          where: { id: campaignId },
          data: { status: 'SENDING', startedAt: new Date() }
        });
      } else {
        // Just verify/update startedAt if empty
        if (!campaign.startedAt) {
          await prisma.campaign.update({
            where: { id: campaignId },
            data: { startedAt: new Date() }
          });
        }
      }

      // Log start
      await prisma.campaignLog.create({
        data: {
          campaignId,
          level: 'INFO',
          message: `Campaign dispatch started. Recipient count: ${campaign.recipients.length}`
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

      // 3. Loop recipients and dispatch
      for (const recipient of campaign.recipients) {
        // Check if campaign was paused or cancelled in between
        const currentCampaign = await prisma.campaign.findUnique({
          where: { id: campaignId },
          select: { status: true }
        });

        if (!currentCampaign || currentCampaign.status !== 'SENDING') {
          console.log(`[Campaign Processor] Dispatch suspended because Campaign Status is now: ${currentCampaign?.status}`);
          await prisma.campaignLog.create({
            data: {
              campaignId,
              level: 'INFO',
              message: `Campaign sending suspended. Current status: ${currentCampaign?.status || 'DELETED'}`
            }
          });
          return;
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
          return;
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
          return;
        }

        // Double check status to prevent duplicate sends
        const freshRecipient = await prisma.campaignRecipient.findUnique({
          where: { id: recipient.id },
          select: { status: true }
        });

        if (freshRecipient?.status !== 'PENDING') {
          console.log(`[Campaign Processor] Recipient ${recipient.id} already processed. Skipping.`);
          continue;
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

        // Apply rate limiting delay
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }

      // 4. Mark campaign completed if all recipients processed
      const pendingCount = await prisma.campaignRecipient.count({
        where: { campaignId, status: 'PENDING' }
      });

      const sendingCount = await prisma.campaignRecipient.count({
        where: { campaignId, status: 'SENDING' }
      });

      if (pendingCount === 0 && sendingCount === 0) {
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
      }
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
    }
  })();
}
