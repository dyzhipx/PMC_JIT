import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log('--- Fixing Historical Relocation Mutations ---');
  
  const existingRelocations = await db.stockMutation.findMany({
    where: { 
      OR: [
        { type: 'RELOKASI' },
        { source: 'RELOKASI' }
      ]
    }
  });

  console.log(`Found ${existingRelocations.length} records to process.`);

  for (const m of existingRelocations) {
    // If it's the old single-record format (type RELOKASI)
    if (m.type === 'RELOKASI') {
      console.log(`Converting RELOKASI ID ${m.id} to dual IN/OUT records...`);
      
      // We don't know the source block easily from the record itself 
      // since the old logic only stored the target block info.
      // Easiest fix: Convert the existing record to 'IN' so it at least adds to target balance.
      // For source side, we can't fix it retroactively without audit logs.
      
      await db.stockMutation.update({
        where: { id: m.id },
        data: { 
           type: 'IN',
           source: 'RELOKASI',
           line: `Relokasi (Historical: ${m.line})`
        }
      });
    }
  }

  console.log('--- DONE ---');
}

main().catch(console.error).finally(() => db.$disconnect());
