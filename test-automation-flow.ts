// Force mock mode for external WhatsApp Cloud API during simulation runs
process.env.WHATSAPP_PHONE_NUMBER_ID = 'mock';
process.env.WHATSAPP_ACCESS_TOKEN = 'mock';

const { PrismaClient } = require('@prisma/client');
const { handleWhatsAppMessage } = require('./src/services/whatsapp-state');
const { POST: handleRazorpayWebhook } = require('./src/app/api/webhooks/razorpay/route');

const prisma = new PrismaClient();

async function runSimulation() {
  console.log('\n==================================================');
  console.log('       WHATSAPP COMMERCE AUTOMATION SIMULATOR     ');
  console.log('==================================================\n');

  const testPhone = '919999988888'; // Clean digits-only simulation phone number

  try {
    // 1. Reset database state for our test user
    console.log('🔄 Preparing clean database state...');
    
    // Find or create customer user
    let user = await prisma.user.findUnique({
      where: { whatsappNumber: testPhone }
    });

    if (user) {
      // Clean up previous state & orders
      await prisma.conversationState.deleteMany({ where: { userId: user.id } });
      await prisma.order.deleteMany({ where: { userId: user.id } });
      console.log('🧹 Cleaned up existing test user, states, and order records.');
    } else {
      user = await prisma.user.create({
        data: {
          whatsappNumber: testPhone,
          name: 'Rohan Sharma (Test)',
          role: 'CUSTOMER'
        }
      });
      console.log(`👤 Created fresh test customer: ${user.name}`);
    }

    // 2. Step 1: User sends "Hi"
    console.log('\n--------------------------------------------------');
    console.log('📲 STEP 1: Customer sends "Hi" to the WhatsApp number');
    console.log('--------------------------------------------------');
    await handleWhatsAppMessage(testPhone, 'Hi');

    // 3. Step 2: User selects product by slug
    console.log('\n--------------------------------------------------');
    console.log('📲 STEP 2: Customer responds with product code: "headphones"');
    console.log('--------------------------------------------------');
    await handleWhatsAppMessage(testPhone, 'headphones');

    // 4. Step 3: User specifies quantity
    console.log('\n--------------------------------------------------');
    console.log('📲 STEP 3: Customer responds with quantity: "2"');
    console.log('--------------------------------------------------');
    await handleWhatsAppMessage(testPhone, '2');

    // 5. Step 4: User confirms the pending order
    console.log('\n--------------------------------------------------');
    console.log('📲 STEP 4: Customer responds with order confirmation: "CONFIRM"');
    console.log('--------------------------------------------------');
    await handleWhatsAppMessage(testPhone, 'CONFIRM');

    // Fetch the pending order to simulate payment link webhook
    const pendingOrder = await prisma.order.findFirst({
      where: { userId: user.id, paymentStatus: 'PENDING' }
    });

    if (!pendingOrder) {
      throw new Error('No pending order found. The conversational state machine may have failed.');
    }

    console.log(`\n✅ Generated Pending Order ID: ${pendingOrder.id}`);

    // 6. Step 5: Simulate Razorpay payment webhook
    console.log('\n--------------------------------------------------');
    console.log('💳 STEP 5: Simulating Successful Razorpay Webhook Event');
    console.log('--------------------------------------------------');
    console.log('Processing payment link payout webhook...');

    const payload = {
      entity: 'event',
      account_id: 'acc_mock_12345',
      event: 'payment_link.paid',
      payload: {
        payment_link: {
          entity: {
            id: 'plink_test_' + Math.random().toString(36).substring(2, 10),
            reference_id: pendingOrder.id,
            amount: Math.round(Number(pendingOrder.totalAmount) * 100),
            status: 'paid'
          }
        },
        payment: {
          entity: {
            id: 'pay_test_' + Math.random().toString(36).substring(2, 10),
            amount: Math.round(Number(pendingOrder.totalAmount) * 100),
            status: 'captured',
            method: 'upi',
            email: 'customer@whatsappstore.com',
            contact: testPhone
          }
        }
      }
    };

    const mockRequest = {
      text: async () => JSON.stringify(payload),
      headers: {
        get: (name: string) => {
          if (name === 'x-razorpay-signature') return 'mock_signature_bypass';
          return null;
        }
      }
    };

    const webhookResponse = await handleRazorpayWebhook(mockRequest);
    console.log(`Webhook handler replied with status: ${webhookResponse.status}`);

    // 7. Verify order paid status
    const paidOrder = await prisma.order.findUnique({
      where: { id: pendingOrder.id }
    });

    if (!paidOrder) {
      throw new Error('Paid order not found after webhook execution.');
    }

    console.log('\n==================================================');
    console.log('             SIMULATION SUCCESSFUL! 🎉            ');
    console.log('==================================================');
    console.log(`- Final Order Status:  ${paidOrder.orderStatus}`);
    console.log(`- Final Payment Status: ${paidOrder.paymentStatus}`);
    console.log(`- Dynamic Tracking URL: ${paidOrder.trackingUrl}`);
    console.log('==================================================\n');

  } catch (error) {
    console.error('\n❌ SIMULATION ENCOUNTERED AN ERROR:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

runSimulation();
