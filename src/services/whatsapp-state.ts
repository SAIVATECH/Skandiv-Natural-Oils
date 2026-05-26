import { prisma } from '@/lib/prisma';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { createPaymentLink } from '@/lib/razorpay';

/**
 * Main entrance router for handling incoming customer WhatsApp messages.
 * Parses user input, matches conversation states, executes steps, and updates the DB.
 * 
 * @param fromNumber Customer's WhatsApp number (e.g. "whatsapp:+919876543210" or "919876543210")
 * @param bodyText Customer's incoming text content
 */
export async function handleWhatsAppMessage(fromNumber: string, bodyText: string) {
  const text = bodyText.trim().toLowerCase();

  // Normalize the phone number to digits only (e.g., '919876543210')
  const normalizedNumber = fromNumber.replace(/^whatsapp:/i, '').replace(/\D/g, '');

  try {
    const { addSimulatorLog } = require('@/lib/simulator-store');
    addSimulatorLog('CUSTOMER', normalizedNumber, bodyText);
  } catch (err) {
    console.error('Failed to log customer message to simulator store:', err);
  }

  try {
    // 1. Authenticate / Retrieve Customer Record (Create if new)
    let user = await prisma.user.findUnique({
      where: { whatsappNumber: normalizedNumber },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          whatsappNumber: normalizedNumber,
          name: `Customer ${normalizedNumber.substring(0, 5)}...`,
          role: 'CUSTOMER',
        },
      });
    }

    // 2. Load Conversation State (Create standard START state if new)
    let state = await prisma.conversationState.findUnique({
      where: { userId: user.id },
    });

    if (!state) {
      state = await prisma.conversationState.create({
        data: {
          userId: user.id,
          currentStep: 'START',
        },
      });
    }

    console.log(`[State Machine] Customer: ${user.name} (${fromNumber}), Current Step: ${state.currentStep}, Input: "${bodyText}"`);

    // Global commands to start over
    if (text === 'reset' || text === 'menu' || text === 'hi' || text === 'hello') {
      await prisma.conversationState.update({
        where: { userId: user.id },
        data: {
          currentStep: 'START',
          selectedProductId: null,
          quantity: null,
          pendingOrderId: null,
        },
      });
      state.currentStep = 'START';
    }

    // 3. Process Conversation Step
    switch (state.currentStep) {
      case 'START':
        await handleStepStart(user, state);
        break;

      case 'SELECT_PRODUCT':
        await handleStepSelectProduct(user, state, text);
        break;

      case 'SELECT_QUANTITY':
        await handleStepSelectQuantity(user, state, text);
        break;

      case 'GET_ADDRESS':
        await handleStepGetAddress(user, state, bodyText);
        break;

      case 'CONFIRM_ORDER':
        await handleStepConfirmOrder(user, state, text);
        break;

      case 'AWAITING_PAYMENT':
        await handleStepAwaitingPayment(user, state);
        break;

      default:
        // Fail-safe reset
        await prisma.conversationState.update({
          where: { userId: user.id },
          data: { currentStep: 'START' },
        });
        await sendWhatsAppMessage(user.whatsappNumber, "Oops! Something went wrong in our messaging flow. Let's start fresh. Reply 'HI' to view our store menu.");
        break;
    }
  } catch (error: any) {
    console.error(`[State Machine Error] Failed during WhatsApp state machine for ${normalizedNumber}:`, error);
    try {
      const { addSimulatorLog } = require('@/lib/simulator-store');
      addSimulatorLog('ERROR', normalizedNumber, error?.message || String(error));
    } catch (err) {
      console.error('Failed to log state machine error to simulator store:', err);
    }
    await sendWhatsAppMessage(normalizedNumber, "Sorry, I ran into an error processing your request. Let's start over by clicking below.", {
      type: 'button',
      buttons: [
        { id: 'menu', title: '🛍️ Catalog Menu' }
      ]
    });
  }

}

/**
 * STEP 1: START
 * Displays a welcome message and lists available active products with shortcodes.
 */
async function handleStepStart(user: any, state: any) {
  // Fetch active products (show all active products regardless of stock status)
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { category: 'asc' },
  });

  if (products.length === 0) {
    await sendWhatsAppMessage(
      user.whatsappNumber,
      "Welcome to our WhatsApp Store! 🛍️\n\nWe are currently restocking our inventory. Please check back later!"
    );
    return;
  }

  const welcomeMessage = `Welcome to our Skandiv Natural Oils! 🛍️\n\nExplore our premium catalog below. Click the button below to open the catalog or reply with its code word (e.g. *coconut oil*, *Groundnut oil* or *Seasame oil*):`;

  // Update State to SELECT_PRODUCT
  await prisma.conversationState.update({
    where: { id: state.id },
    data: { currentStep: 'SELECT_PRODUCT' },
  });

  await sendWhatsAppMessage(user.whatsappNumber, welcomeMessage, {
    type: 'list',
    buttonText: '🛍️ View Products',
    sections: [
      {
        title: 'Premium Catalog',
        rows: products.map((prod: any) => ({
          id: prod.slug,
          title: prod.name.substring(0, 24),
          description: `${prod.stock === 0 ? '🚫 OUT OF STOCK' : `₹${Number(prod.price).toLocaleString('en-IN')}`} - ${prod.description.substring(0, 42)}...`
        }))
      }
    ]
  });
}

/**
 * STEP 2: SELECT_PRODUCT
 * Checks if customer's code word matches a product slug, and asks for quantity.
 */
async function handleStepSelectProduct(user: any, state: any, input: string) {
  // Try to find product by slug
  const product = await prisma.product.findFirst({
    where: {
      slug: input,
      isActive: true,
      stock: { gt: 0 },
    },
  });

  if (!product) {
    await sendWhatsAppMessage(
      user.whatsappNumber,
      `Sorry, we couldn't find that item or it is out of stock. 🚫\n\nPlease reply with a valid product code (e.g., *coconut oil, Groundnut oil, Seasame oil*).\n\nReply *MENU* to view the entire catalogue again.`
    );
    return;
  }

  // Update conversation state with product
  await prisma.conversationState.update({
    where: { id: state.id },
    data: {
      selectedProductId: product.id,
      currentStep: 'SELECT_QUANTITY',
    },
  });

  const selectQtyMsg = `You selected *${product.name}* (₹${Number(product.price).toLocaleString('en-IN')} each). Great choice! 👍\n\nHow many units would you like to buy? Choose from the options below, or reply with your desired quantity (1-${product.stock}):`;

  await sendWhatsAppMessage(user.whatsappNumber, selectQtyMsg, {
    type: 'button',
    imageUrl: product.imageUrl || undefined,
    buttons: [
      { id: '1', title: 'Buy 1 Unit' },
      { id: '2', title: 'Buy 2 Units' },
      { id: '3', title: 'Buy 3 Units' }
    ]
  });
}

/**
 * STEP 3: SELECT_QUANTITY
 * Parses quantity, verifies stock levels, generates pending Order and OrderItems, and asks for confirmation.
 */
async function handleStepSelectQuantity(user: any, state: any, input: string) {
  if (!state.selectedProductId) {
    // Fail-safe back to START
    await prisma.conversationState.update({
      where: { id: state.id },
      data: { currentStep: 'START' },
    });
    await sendWhatsAppMessage(user.whatsappNumber, "Your checkout session timed out. Let's start again! Reply 'HI'.");
    return;
  }

  const quantity = parseInt(input);

  // Fetch the selected product to verify stock
  const product = await prisma.product.findUnique({
    where: { id: state.selectedProductId },
  });

  if (!product) {
    await sendWhatsAppMessage(user.whatsappNumber, "The selected product is no longer available. Reply *MENU* to start over.");
    return;
  }

  // Validate custom quantity up to available stock limit
  if (isNaN(quantity) || quantity < 1 || quantity > product.stock) {
    await sendWhatsAppMessage(
      user.whatsappNumber,
      `Oops! That is an invalid quantity. 🔢\n\nPlease enter a valid quantity between *1* and *${product.stock}* (available stock):`
    );
    return;
  }

  // Calculate order total
  const totalAmount = Number(product.price) * quantity;

  // Create pending order (with blank shippingAddress initially)
  const pendingOrder = await prisma.order.create({
    data: {
      userId: user.id,
      totalAmount: totalAmount,
      paymentStatus: 'PENDING',
      orderStatus: 'PENDING',
      shippingAddress: '',
      items: {
        create: {
          productId: product.id,
          quantity: quantity,
          price: product.price,
        },
      },
    },
  });

  // Update State to GET_ADDRESS
  await prisma.conversationState.update({
    where: { id: state.id },
    data: {
      quantity: quantity,
      pendingOrderId: pendingOrder.id,
      currentStep: 'GET_ADDRESS',
    },
  });

  const addressPrompt = `Great choice! *${quantity}* unit(s) of *${product.name}* reserved. 📦\n\n` +
    `🚚 Please reply with your **complete Shipping Address** (including Street, City, State, and Pincode) so we can calculate shipping and prepare delivery:`;

  await sendWhatsAppMessage(user.whatsappNumber, addressPrompt);
}

/**
 * STEP 4: GET_ADDRESS
 * Captures customer's raw shipping address, updates the pending order, and presents order summary.
 */
async function handleStepGetAddress(user: any, state: any, input: string) {
  if (!state.pendingOrderId || !state.selectedProductId || !state.quantity) {
    await prisma.conversationState.update({
      where: { id: state.id },
      data: { currentStep: 'START' },
    });
    await sendWhatsAppMessage(user.whatsappNumber, "Checkout session expired. Reply *HI* to restart.");
    return;
  }

  const shippingAddress = input.trim();

  if (shippingAddress.length < 10) {
    await sendWhatsAppMessage(
      user.whatsappNumber,
      "Oops! That address seems too short. 🚚\n\nPlease reply with a complete shipping address (including Street, City, and Pincode) so we can safely deliver your order:"
    );
    return;
  }

  // Update the pending order with the shipping address
  await prisma.order.update({
    where: { id: state.pendingOrderId },
    data: { shippingAddress: shippingAddress } as any, // Cast as any if local Prisma Types are not refreshed in compile engine
  });

  // Transition state to CONFIRM_ORDER
  await prisma.conversationState.update({
    where: { id: state.id },
    data: { currentStep: 'CONFIRM_ORDER' },
  });

  // Fetch product and pending order details to construct the Invoice Summary
  const product = await prisma.product.findUnique({
    where: { id: state.selectedProductId },
  });

  if (!product) {
    await sendWhatsAppMessage(user.whatsappNumber, "The selected product is no longer available. Reply *HI* to restart.");
    return;
  }

  const totalAmount = Number(product.price) * state.quantity;

  const summaryMsg = `📝 *ORDER SUMMARY*\n` +
    `----------------------------------\n` +
    `📦 *Item:* ${product.name}\n` +
    `🔢 *Quantity:* ${state.quantity}\n` +
    `💰 *Total Amount:* ₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n` +
    `🚚 *Deliver To:* ${shippingAddress}\n` +
    `----------------------------------\n\n` +
    `Do you wish to confirm and proceed to payment? Choose an option below:`;

  await sendWhatsAppMessage(user.whatsappNumber, summaryMsg, {
    type: 'button',
    imageUrl: product.imageUrl || undefined,
    buttons: [
      { id: 'confirm', title: '✅ Confirm' },
      { id: 'cancel', title: '❌ Cancel' }
    ]
  });
}

/**
 * STEP 5: CONFIRM_ORDER
 * Generates Razorpay payment link and sends it, moving status to AWAITING_PAYMENT.
 */
async function handleStepConfirmOrder(user: any, state: any, input: string) {
  if (!state.pendingOrderId || !state.selectedProductId || !state.quantity) {
    // State error fail-safe
    await prisma.conversationState.update({
      where: { id: state.id },
      data: { currentStep: 'START' },
    });
    await sendWhatsAppMessage(user.whatsappNumber, "Checkout session expired. Reply *HI* to browse our catalog again.");
    return;
  }

  if (input === 'cancel') {
    // Void the order
    await prisma.order.update({
      where: { id: state.pendingOrderId },
      data: { orderStatus: 'CANCELLED' },
    });

    // Reset conversation state
    await prisma.conversationState.update({
      where: { id: state.id },
      data: {
        currentStep: 'START',
        selectedProductId: null,
        quantity: null,
        pendingOrderId: null,
      },
    });

    await sendWhatsAppMessage(user.whatsappNumber, "Order discarded successfully. 🚫\n\nYou can reply with *HI* at any time to start a new purchase!");
    return;
  }

  if (input !== 'confirm') {
    await sendWhatsAppMessage(
      user.whatsappNumber,
      "Please confirm your purchase by selecting an option below:",
      {
        type: 'button',
        buttons: [
          { id: 'confirm', title: '✅ Confirm' },
          { id: 'cancel', title: '❌ Cancel' }
        ]
      }
    );
    return;
  }

  // Fetch product and pending order details
  const product = await prisma.product.findUnique({
    where: { id: state.selectedProductId },
  });

  const order = await prisma.order.findUnique({
    where: { id: state.pendingOrderId },
  });

  if (!product || !order) {
    await sendWhatsAppMessage(user.whatsappNumber, "Something went wrong retrieving order details. Reply *HI* to restart.");
    return;
  }

  // Generate dynamic Razorpay Payment Link
  const paymentLink = await createPaymentLink(
    order.id,
    Number(order.totalAmount),
    user.name || 'E-Commerce Buyer',
    user.whatsappNumber
  );

  // Update State to AWAITING_PAYMENT
  await prisma.conversationState.update({
    where: { id: state.id },
    data: { currentStep: 'AWAITING_PAYMENT' },
  });

  const paymentMsg = `Order confirmed! 🎉\n\nPlease click the button below to complete your secure payment of *₹${Number(order.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}* via Razorpay.\n\n` +
    `Once the payment is completed, your order will automatically process and your tracking link will be sent here! 🚀`;

  // Send the payment link as a native CTA URL Button
  await sendWhatsAppMessage(user.whatsappNumber, paymentMsg, {
    type: 'cta_url',
    buttonText: '💳 Pay Now',
    buttonUrl: paymentLink.short_url,
  });

  // Send a helper message with navigation shortcuts
  const navigationMsg = `Need to adjust your order or browse again? Use the shortcuts below:`;
  await sendWhatsAppMessage(user.whatsappNumber, navigationMsg, {
    type: 'button',
    buttons: [
      { id: 'menu', title: '🛍️ Catalog Menu' },
      { id: 'reset', title: '🔄 Start Over' }
    ]
  });
}

/**
 * STEP 5: AWAITING_PAYMENT
 * Customer has a payment link active. Gently reminds them or handles cancellations.
 */
async function handleStepAwaitingPayment(user: any, state: any) {
  if (!state.pendingOrderId) {
    await prisma.conversationState.update({
      where: { id: state.id },
      data: { currentStep: 'START' },
    });
    return;
  }

  const order = await prisma.order.findUnique({
    where: { id: state.pendingOrderId },
  });

  if (!order) {
    await prisma.conversationState.update({
      where: { id: state.id },
      data: { currentStep: 'START' },
    });
    return;
  }

  // Resend dynamic payment link as reminder
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const paymentUrl = `${appUrl}/checkout/mock?orderId=${order.id}&amount=${order.totalAmount}&phone=${encodeURIComponent(user.whatsappNumber)}`;

  const reminderMsg = `⏳ *Payment Awaiting*\n\n` +
    `We are still awaiting payment for Order *#${order.id.substring(0, 8).toUpperCase()}* of *₹${Number(order.totalAmount).toLocaleString('en-IN')}*.\n\nPlease click the button below to complete checkout:`;

  // Send the payment link as a native CTA URL Button
  await sendWhatsAppMessage(user.whatsappNumber, reminderMsg, {
    type: 'cta_url',
    buttonText: '💳 Pay Now',
    buttonUrl: paymentUrl,
  });

  // Send a helper message with navigation shortcuts
  const navMsg = `Or choose from the options below:`;
  await sendWhatsAppMessage(user.whatsappNumber, navMsg, {
    type: 'button',
    buttons: [
      { id: 'reset', title: '🔄 Discard & Reset' },
      { id: 'menu', title: '🛍️ Catalog Menu' }
    ]
  });
}
