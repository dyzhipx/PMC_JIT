import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
db.lineSkuMapping.deleteMany().then(() => console.log('Wiped')).finally(()=>process.exit(0));
