import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const kamus = await prisma.kamusOpname.findMany();
  console.log('Kamus Data:', kamus);
}

main().catch(console.error).finally(() => prisma.$disconnect());
