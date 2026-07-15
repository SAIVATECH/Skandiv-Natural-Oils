import { prisma } from '@/lib/prisma';
import { sendWhatsAppTemplateMessage } from '@/lib/whatsapp';

/**
 * Helper to map template variables configuration to Meta Cloud API components format.
 */
/**
 * Sanitize a template parameter value to comply with Meta's character limits.
 * OTP / authentication templates: body params max 15 chars.
 * All other templates: body params max 1024 chars.
 */
function sanitizeParam(text: string, isOtp: boolean): string {
  const maxLen = isOtp ? 15 : 1024;
  if (text.length > maxLen) {
    console.warn(`[Campaign Processor] Parameter "${text.substring(0, 20)}..." exceeds Meta limit of ${maxLen} chars. Truncating.`);
    return text.substring(0, maxLen);
  }
  return text;
}

/**
 * Helper to map template variables configuration to Meta Cloud API components format.
 */
function mapTemplateVariables(varsConfig: any, customer: any, template: any = null): any[] {
  const bodyParams: any[] = [];
  const headerParams: any[] = [];

  // Detect OTP / AUTHENTICATION templates which have a strict 15-char param limit
  const isOtpTemplate = template &&
    (template.category === 'AUTHENTICATION' ||
     (Array.isArray(template.components) &&
      template.components.some((c: any) =>
        c.type === 'BUTTONS' &&
        Array.isArray(c.buttons) &&
        c.buttons.some((b: any) => b.otp_type || b.type === 'OTP')
      )
     )
    );

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
      bodyParams.push({ type: 'text', text: sanitizeParam(text, isOtpTemplate) });
    });
  }

  if (varsConfig && Array.isArray(varsConfig.header)) {
    varsConfig.header.forEach((v: any) => {
      let val = '';
      if (v.type === 'customer_name') {
        val = customer.name || 'Valued Customer';
      } else {
        val = v.value || '';
      }
      
      // Determine the header format from the template schema
      let headerFormat = 'TEXT';
      if (template && Array.isArray(template.components)) {
        const headerComp = template.components.find((c: any) => c.type === 'HEADER' || c.type === 'header');
        if (headerComp && headerComp.format) {
          headerFormat = headerComp.format.toUpperCase();
        }
      }

      if (headerFormat === 'IMAGE') {
        headerParams.push({
          type: 'image',
          image: { link: val }
        });
      } else if (headerFormat === 'VIDEO') {
        headerParams.push({
          type: 'video',
          video: { link: val }
        });
      } else if (headerFormat === 'DOCUMENT') {
        headerParams.push({
          type: 'document',
          document: { link: val, filename: 'Document' }
        });
      } else {
        headerParams.push({
          type: 'text',
          text: sanitizeParam(val, false)
        });
      }
    });
  }

  const components: any[] = [];
  if (bodyParams.length > 0) {
    components.push({ type: 'body', parameters: bodyParams });
  }
  if (headerParams.length > 0) {
    components.push({ type: 'header', parameters: headerParams });
  }

  // Automatically map button variables if the template contains a URL button with placeholder variables
  if (template && Array.isArray(template.components)) {
    const buttonsComp = template.components.find((c: any) => c.type === 'BUTTONS' || c.type === 'buttons');
    if (buttonsComp && Array.isArray(buttonsComp.buttons)) {
      buttonsComp.buttons.forEach((btn: any, idx: number) => {
        if (btn.type === 'URL' || btn.type === 'url') {
          // If the URL button requires a variable parameter (contains e.g. {{1}}), map it
          if (btn.url && (btn.url.includes('{{1}}') || btn.url.includes('{{2}}'))) {
            // Use the first body variable value (typically the OTP code or custom text)
            let btnText = '12345';
            if (bodyParams.length > 0 && bodyParams[0].text) {
              btnText = bodyParams[0].text;
            } else if (customer.name) {
              btnText = customer.name;
            }

            components.push({
              type: 'button',
              sub_type: 'url',
              index: String(idx),
              parameters: [
                {
                  type: 'text',
                  // Button URL param also has a 15-char limit
                  text: sanitizeParam(btnText, true)
                }
              ]
            });
          }
        }
      });
    }

    // Automatically inject media header parameters if the template requires an IMAGE, VIDEO, or DOCUMENT header
    // but the campaign UI configuration did not provide one (which is the case since the UI only maps body vars)
    const headerComp = template.components.find((c: any) => c.type === 'HEADER' || c.type === 'header');
    if (headerComp && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerComp.format?.toUpperCase())) {
      // Only inject if no header parameters were populated yet
      if (headerParams.length === 0) {
        let mediaUrl = '';
        let rawUrl = '';
        
        // Extract example media link from template schema if available
        if (headerComp.example && Array.isArray(headerComp.example.header_handle) && headerComp.example.header_handle[0]) {
          rawUrl = headerComp.example.header_handle[0];
        } else if (headerComp.example && Array.isArray(headerComp.example.header_url) && headerComp.example.header_url[0]) {
          rawUrl = headerComp.example.header_url[0];
        }

        // Facebook CDN links expire and return 403 Forbidden.
        // If the link is empty or is a Facebook temporary attachment link, use a guaranteed public CDN product image.
        // We use a high-quality Unsplash image of a natural essential oil bottle to bypass Vercel's WAF / Bot Protection
        // which blocks Meta's automated servers from downloading the local logo.jpg asset.
        if (rawUrl && !rawUrl.includes('fbcdn.net') && !rawUrl.includes('facebook') && !rawUrl.includes('attachment')) {
          mediaUrl = rawUrl;
        } else {
          mediaUrl = 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=600&auto=format&fit=crop';
        }

        const fmt = headerComp.format.toUpperCase();
        if (fmt === 'IMAGE') {
          headerParams.push({
            type: 'image',
            image: { link: mediaUrl }
          });
        } else if (fmt === 'VIDEO') {
          headerParams.push({
            type: 'video',
            video: { link: mediaUrl }
          });
        } else if (fmt === 'DOCUMENT') {
          headerParams.push({
            type: 'document',
            document: { link: mediaUrl, filename: 'Document' }
          });
        }
        
        // Re-push header component to structure the final API components payload
        // (if it wasn't added before)
        const hasHeader = components.some((c: any) => c.type === 'header');
        if (!hasHeader) {
          components.push({ type: 'header', parameters: headerParams });
        }
      }
    }
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
    // 1. Fetch Campaign Details to verify existence
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      console.error(`[Campaign Processor] Campaign not found: ${campaignId}`);
      return { processedCount: 0, hasMore: false };
    }

    // Fetch the stored template schema from the database
    const template = await prisma.campaignTemplate.findUnique({
      where: { name: campaign.templateName }
    });

    // Set status to SENDING if it isn't already
    if (campaign.status !== 'SENDING') {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: 'SENDING', startedAt: campaign.startedAt || new Date() }
      });
    }

    // 2. Fetch and atomically mark a batch of PENDING recipients as SENDING inside a transaction.
    // This locks the selected records so no concurrent execution loop can select the same recipients.
    const recipients = await prisma.$transaction(async (tx) => {
      const pending = await tx.campaignRecipient.findMany({
        where: { campaignId, status: 'PENDING' },
        include: { customer: true },
        take: batchSize
      });

      if (pending.length === 0) return [];

      const ids = pending.map(p => p.id);
      await tx.campaignRecipient.updateMany({
        where: { id: { in: ids } },
        data: { status: 'SENDING' }
      });

      return pending;
    });

    if (recipients.length === 0) {
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
        message: `Processing batch of ${recipients.length} recipients.`
      }
    });

    // 3. Fetch Settings
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

    // 4. Loop recipients and dispatch
    for (const recipient of recipients) {
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

      // Map variables (including button parameters from template schema)
      const components = mapTemplateVariables(campaign.templateVariables, recipient.customer, template);

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
      if (processedCount < recipients.length) {
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
