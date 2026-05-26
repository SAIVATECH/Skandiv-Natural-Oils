import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Migrating Supabase database to add message_logs table...');
  try {
    // Create the message_logs table if it does not already exist
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS message_logs (
        id TEXT PRIMARY KEY,
        sender TEXT NOT NULL,
        phone TEXT NOT NULL,
        text TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Table message_logs checked/created successfully!');
  } catch (error) {
    console.error('❌ Failed to run migration SQL:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
