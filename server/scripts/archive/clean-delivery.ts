import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  await db.deliveryScan.deleteMany();
  await db.deliveryItem.deleteMany();
  await db.delivery.deleteMany();
  console.log('✅ Delivery data cleared');
}
main()
  .catch(console.error)
  .finally(() => db.$disconnect());
