import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Checking products in database...');
  try {
    const products = await prisma.product.findMany();
    console.log(`Found ${products.length} products:`);
    products.forEach(p => {
      console.log(`- Product: ${p.name}`);
      console.log(`  Slug: ${p.slug}`);
      console.log(`  Stock: ${p.stock}`);
      console.log(`  IsActive: ${p.isActive}`);
      console.log(`  Image URL: ${p.imageUrl || '(None)'}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error fetching products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
