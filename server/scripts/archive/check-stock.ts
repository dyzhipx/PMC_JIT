import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const lineStock = await prisma.lineStock.findFirst({ 
    where: { line: 'Line A', materialName: 'PLASTIK ABC SUSU 30 GR (R3)' } 
  });
  console.log("Line A Stock:", lineStock);
}
check().finally(() => prisma.$disconnect());
