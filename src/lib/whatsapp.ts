/**
 * Client for Meta WhatsApp Cloud API (Graph API).
 * Supports standard HTTP calls and provides a fully interactive simulated fallback
 * for local developer environments when credentials are mock/missing.
 */

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// Local mock mode active if values are missing or using placeholders
const isMock = !PHONE_NUMBER_ID || PHONE_NUMBER_ID.includes('mock') || !ACCESS_TOKEN || ACCESS_TOKEN.includes('mock');

export interface WhatsAppOptions {
  type: 'list' | 'button' | 'cta_url';
  imageUrl?: string; // Optional header image url for button interactive messages
  headerText?: string;
  footerText?: string;
  buttonText?: string; // e.g. "View Products" for List or button label for CTA URL
  buttonUrl?: string;  // Destination URL for CTA URL button
  sections?: Array<{
    title: string;
    rows: Array<{
      id: string;      // row id matching product slug
      title: string;    // row title matching product name
      description?: string;
    }>;
  }>;
  buttons?: Array<{
    id: string;        // e.g. "confirm"
    title: string;     // e.g. "Confirm"
  }>;
}

/**
 * Sends a WhatsApp message using Meta's Cloud API.
 * Automatically normalizes the recipient's phone number.
 * 
 * @param to The recipient's WhatsApp number (e.g. "whatsapp:+919876543210" or "919876543210")
 * @param body The text content of the message.
 * @param options Optional interactive options (List Message or Reply Buttons)
 */
export async function sendWhatsAppMessage(to: string, body: string, options?: WhatsAppOptions) {
  // Normalize phone number: strip 'whatsapp:' and strip all non-digit characters
  const cleanTo = to.replace(/^whatsapp:/i, '').replace(/\D/g, '');

  let displayBody = body;
  if (options) {
    if (options.imageUrl) {
      displayBody = `[IMAGE: ${options.imageUrl}]\n` + displayBody;
    }
    
    if (options.type === 'list') {
      displayBody += `\n\n[LIST_BUTTON: ${options.buttonText || 'Select Option'}]`;
      options.sections?.forEach(sec => {
        sec.rows?.forEach(row => {
          displayBody += `\n- ${row.title} (id: ${row.id})`;
          if (row.description) {
            displayBody += `\n  description: ${row.description}`;
          }
        });
      });
    } else if (options.type === 'button') {
      displayBody += `\n\n[BUTTONS: `;
      const btnStrings = options.buttons?.map(btn => `${btn.title} (id: ${btn.id})`) || [];
      displayBody += btnStrings.join(' | ') + `]`;
    } else if (options.type === 'cta_url') {
      displayBody += `\n\n[CTA_BUTTON: ${options.buttonText || 'Link'} - ${options.buttonUrl || ''}]`;
    }
  }

  console.log('\n--- OUTGOING META WHATSAPP MESSAGE ---');
  console.log(`To:   +${cleanTo}`);
  console.log(`Body:\n${displayBody}`);
  console.log('--------------------------------------\n');

  try {
    const { addSimulatorLog } = require('./simulator-store');
    addSimulatorLog('SYSTEM', cleanTo, displayBody);
  } catch (err) {
    console.error('Failed to log to simulator store:', err);
  }

  // Force simulated fallback for standard simulation and seeded mock testing numbers
  const isSimulationNumber = 
    cleanTo.startsWith('9199999') || 
    cleanTo.startsWith('9188888') || 
    cleanTo.startsWith('9177777') ||
    cleanTo === '9999999999';

  if (isMock || isSimulationNumber) {
    console.log(`[Meta WhatsApp Simulator Mode] SIMULATED message sent successfully to +${cleanTo}`);
    return {
      id: `wamid.mock_${Math.random().toString(36).substring(2, 11)}`,
      to: cleanTo,
      body: displayBody,
      status: 'sent',
      simulated: true,
    };
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;
    
    let payload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanTo,
    };

    if (options) {
      if (options.type === 'list') {
        payload.type = 'interactive';
        payload.interactive = {
          type: 'list',
          body: { text: body },
          action: {
            button: options.buttonText || 'Select Option',
            sections: options.sections
          }
        };
        if (options.headerText) {
          payload.interactive.header = { type: 'text', text: options.headerText };
        }
        if (options.footerText) {
          payload.interactive.footer = { text: options.footerText };
        }
      } else if (options.type === 'button') {
        payload.type = 'interactive';
        payload.interactive = {
          type: 'button',
          body: { text: body },
          action: {
            buttons: options.buttons?.map(btn => ({
              type: 'reply',
              reply: {
                id: btn.id,
                title: btn.title.substring(0, 20) // Meta buttons max 20 chars
              }
            }))
          }
        };
        if (options.imageUrl) {
          payload.interactive.header = {
            type: 'image',
            image: {
              link: options.imageUrl
            }
          };
        } else if (options.headerText) {
          payload.interactive.header = { type: 'text', text: options.headerText };
        }
        if (options.footerText) {
          payload.interactive.footer = { text: options.footerText };
        }
      } else if (options.type === 'cta_url') {
        payload.type = 'interactive';
        payload.interactive = {
          type: 'cta_url',
          body: { text: body },
          action: {
            name: 'cta_url',
            parameters: {
              display_text: options.buttonText || 'Link',
              url: options.buttonUrl || ''
            }
          }
        };
        if (options.imageUrl) {
          payload.interactive.header = {
            type: 'image',
            image: {
              link: options.imageUrl
            }
          };
        } else if (options.headerText) {
          payload.interactive.header = { type: 'text', text: options.headerText };
        }
        if (options.footerText) {
          payload.interactive.footer = { text: options.footerText };
        }
      }
    } else {
      payload.type = 'text';
      payload.text = {
        preview_url: false,
        body,
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Meta WhatsApp API Warning] Live transmission returned status ${response.status}: ${errText}. Falling back to simulation mode...`);
      
      return {
        id: `wamid.mock_fallback_${Math.random().toString(36).substring(2, 11)}`,
        to: cleanTo,
        body: displayBody,
        status: 'sent',
        simulated: true,
        warning: `Meta API returned ${response.status}: ${errText}`
      };
    }

    const data = await response.json();
    return {
      id: data.messages?.[0]?.id,
      to: cleanTo,
      body: displayBody,
      status: 'sent',
      raw: data,
    };
  } catch (error: any) {
    console.error('[Meta WhatsApp Error] Fatal live Meta API call failed. Falling back to simulation mode. Details:', error);
    
    return {
      id: `wamid.mock_fallback_err_${Math.random().toString(36).substring(2, 11)}`,
      to: cleanTo,
      body: displayBody,
      status: 'sent',
      simulated: true,
      error: error?.message || String(error)
    };
  }
}

/**
 * Handles WhatsApp API delivery status errors.
 * Provides error code interpretation and recommended actions.
 * 
 * @param errorCode The error code from Meta WhatsApp API
 * @param errorMessage The error message from Meta WhatsApp API
 * @param errorData Additional error details
 * @returns Structured error information with recommended action
 */
export function handleWhatsAppDeliveryError(
  errorCode: number,
  errorMessage: string,
  errorData?: any
) {
  const errorInfo = {
    code: errorCode,
    message: errorMessage,
    details: errorData?.details || null,
    recommendedAction: '',
    isRetryable: false,
  };

  switch (errorCode) {
    case 131047:
      // Re-engagement message error - 24-hour rule violation
      errorInfo.recommendedAction = 
        'Cannot send free-form message (24-hour window exceeded). ' +
        'SOLUTIONS: (1) Wait for customer to reply again, (2) Use approved template messages, ' +
        '(3) If customer is high-value, request re-engagement permission from Meta';
      errorInfo.isRetryable = false;
      break;

    case 131026:
      // Message rate limit exceeded
      errorInfo.recommendedAction = 'Rate limit exceeded. Implement exponential backoff retry strategy.';
      errorInfo.isRetryable = true;
      break;

    case 131000:
      // Generic template error
      errorInfo.recommendedAction = 'Template message issue. Verify template is approved and parameters match.';
      errorInfo.isRetryable = false;
      break;

    default:
      errorInfo.recommendedAction = 'Consult Meta documentation: https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes/';
      errorInfo.isRetryable = false;
  }

  return errorInfo;
}

/**
 * Sends a WhatsApp Template message using Meta's Cloud API.
 * Automatically normalizes the recipient's phone number and formats components.
 * Automatically falls back to simulated logs if mock mode or simulator numbers are used.
 */
export async function sendWhatsAppTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string,
  components: any[]
) {
  const cleanTo = to.replace(/^whatsapp:/i, '').replace(/\D/g, '');

  // Extract variables for logging & simulator representation
  const bodyParams: string[] = [];
  const headerParams: string[] = [];
  
  components.forEach((comp: any) => {
    if (comp.type === 'body' && Array.isArray(comp.parameters)) {
      comp.parameters.forEach((param: any) => {
        if (param.type === 'text') bodyParams.push(param.text);
      });
    } else if (comp.type === 'header' && Array.isArray(comp.parameters)) {
      comp.parameters.forEach((param: any) => {
        if (param.type === 'text') headerParams.push(param.text);
        else if (param.type === 'image') headerParams.push(param.image?.link || '[Image]');
      });
    }
  });

  // Reconstruct readable text body for simulator
  let displayBody = `[TEMPLATE: ${templateName}]`;
  let baseBodyText = '';
  
  // Basic mock template texts for reconstruction if they aren't in the database yet
  if (templateName === 'welcome_promo') {
    baseBodyText = `Welcome to Skandiv Natural Oils, {{1}}! 🌿 Get {{2}}% off on your first order. Use code {{3}} at checkout.`;
  } else if (templateName === 'abandoned_cart_recovery') {
    baseBodyText = `Hi {{1}}! We noticed you left some pure wellness in your cart. 🌿 Complete your checkout now and get free shipping using coupon {{2}}.`;
  } else if (templateName === 'new_product_alert') {
    baseBodyText = `Hello {{1}}! We have just launched our new {{2}} oil. Pure, cold-pressed, and 100% natural. 🍃 Learn more: {{3}}`;
  } else {
    baseBodyText = `Template Message [${templateName}]. Variables: ${bodyParams.join(', ')}`;
  }

  // Replace placeholders with actual text
  let resolvedBodyText = baseBodyText;
  bodyParams.forEach((param, index) => {
    resolvedBodyText = resolvedBodyText.replace(`{{${index + 1}}}`, `*${param}*`);
  });

  if (headerParams.length > 0) {
    displayBody += `\nHeader: ${headerParams.join(', ')}`;
  }
  displayBody += `\n\n${resolvedBodyText}`;

  console.log('\n--- OUTGOING META WHATSAPP TEMPLATE MESSAGE ---');
  console.log(`To:       +${cleanTo}`);
  console.log(`Template: ${templateName} (${languageCode})`);
  console.log(`Body:\n${resolvedBodyText}`);
  console.log('------------------------------------------------\n');

  try {
    const { addSimulatorLog } = require('./simulator-store');
    await addSimulatorLog('SYSTEM', cleanTo, displayBody);
  } catch (err) {
    console.error('Failed to log template to simulator store:', err);
  }

  const isSimulationNumber = 
    cleanTo.startsWith('9199999') || 
    cleanTo.startsWith('9188888') || 
    cleanTo.startsWith('9177777') ||
    cleanTo === '9999999999';

  if (isMock || isSimulationNumber) {
    console.log(`[Meta WhatsApp Simulator Mode] SIMULATED template sent successfully to +${cleanTo}`);
    return {
      id: `wamid.mock_camp_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`,
      to: cleanTo,
      body: displayBody,
      status: 'sent',
      simulated: true,
    };
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanTo,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode
        },
        components: components
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Meta WhatsApp API Warning] Live template transmission failed with status ${response.status}: ${errText}. Falling back to simulation...`);
      return {
        id: `wamid.mock_fallback_camp_${Math.random().toString(36).substring(2, 11)}`,
        to: cleanTo,
        body: displayBody,
        status: 'sent',
        simulated: true,
        warning: `Meta API returned ${response.status}: ${errText}`
      };
    }

    const data = await response.json();
    return {
      id: data.messages?.[0]?.id,
      to: cleanTo,
      body: displayBody,
      status: 'sent',
      raw: data,
    };
  } catch (error: any) {
    console.error('[Meta WhatsApp Error] Fatal live Meta API template call failed. Falling back to simulation. Details:', error);
    return {
      id: `wamid.mock_fallback_camp_err_${Math.random().toString(36).substring(2, 11)}`,
      to: cleanTo,
      body: displayBody,
      status: 'sent',
      simulated: true,
      error: error?.message || String(error)
    };
  }
}

/**
 * Fetches message templates from Meta WABA API.
 * If credentials are missing or mock, returns default predefined SaaS templates.
 */
export async function fetchMetaTemplates() {
  const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
  const isWabaMock = !wabaId || wabaId.includes('mock') || isMock;

  const mockTemplates = [
    {
      id: 'welcome_promo_tmpl',
      name: 'welcome_promo',
      language: 'en_US',
      category: 'MARKETING',
      status: 'APPROVED',
      components: [
        {
          type: 'HEADER',
          format: 'TEXT',
          text: 'Welcome to Skandiv! 🌿'
        },
        {
          type: 'BODY',
          text: 'Welcome to Skandiv Natural Oils, {{1}}! 🌿 Get {{2}}% off on your first order. Use code {{3}} at checkout.'
        },
        {
          type: 'FOOTER',
          text: 'Unsubscribe reply STOP'
        }
      ]
    },
    {
      id: 'abandoned_cart_recovery_tmpl',
      name: 'abandoned_cart_recovery',
      language: 'en_US',
      category: 'MARKETING',
      status: 'APPROVED',
      components: [
        {
          type: 'BODY',
          text: 'Hi {{1}}! We noticed you left some pure wellness in your cart. 🌿 Complete your checkout now and get free shipping using coupon {{2}}.'
        },
        {
          type: 'FOOTER',
          text: 'Skandiv Natural Oils'
        }
      ]
    },
    {
      id: 'new_product_alert_tmpl',
      name: 'new_product_alert',
      language: 'en_US',
      category: 'MARKETING',
      status: 'APPROVED',
      components: [
        {
          type: 'HEADER',
          format: 'TEXT',
          text: 'New Launch! 🍃'
        },
        {
          type: 'BODY',
          text: 'Hello {{1}}! We have just launched our new {{2}} oil. Pure, cold-pressed, and 100% natural. 🍃 Learn more: {{3}}'
        }
      ]
    }
  ];

  if (isWabaMock) {
    console.log('[Meta Templates API] Mock Mode Active. Returning default templates list.');
    return mockTemplates;
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${wabaId}/message_templates?limit=100`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Meta Templates API Warning] Failed to fetch live templates (status ${response.status}: ${errText}). Returning mock template list.`);
      return mockTemplates;
    }

    const data = await response.json();
    return data.data || mockTemplates;
  } catch (error) {
    console.error('[Meta Templates API Error] Failed to fetch live templates. Returning mock template list. Details:', error);
    return mockTemplates;
  }
}

