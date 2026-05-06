import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function run() {
  const count = await db.lineSkuMapping.count();
  console.log('Total LineSkuMapping in DB:', count);
  const data = await db.lineSkuMapping.findMany();
  console.log('Data:', data);
}

run()
  .catch(console.error)
  .finally(async () => {
    await db.$disconnect();
    process.exit(0);
  });
