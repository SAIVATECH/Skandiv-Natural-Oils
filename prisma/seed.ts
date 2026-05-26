import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up database and removing all seed data...');
  
  // Delete existing records to allow a completely clean database
  await prisma.payment.deleteMany({});
  await prisma.conversationState.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Cleaned all orders, payments, products, states, and users.');

  // Seed Admin User (essential so they can access the admin dashboard)
  const adminUser = await prisma.user.create({
    data: {
      whatsappNumber: '919999999999', // Change this to your real WhatsApp number
      name: 'Admin Store Manager',
      role: 'ADMIN',
    },
  });
  console.log('Created admin user successfully:', adminUser);

  console.log('\n==================================================');
  console.log('   DATABASE CLEANED & READY FOR PRODUCTION! 🎉   ');
  console.log('==================================================');
  console.log('All mock products, orders, and customer histories have');
  console.log('been cleanly wiped.');
  console.log('\nAdmin Credentials Seeded:');
  console.log(`- WhatsApp Number: ${adminUser.whatsappNumber}`);
  console.log('- Role: ADMIN');
  console.log('You can now log in and add your real products via the');
  console.log('Admin Dashboard or seed them manually.');
  console.log('==================================================\n');
}

main()
  .catch((e) => {
    console.error('Error during database cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
