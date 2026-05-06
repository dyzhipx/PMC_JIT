import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function nowTimeStr() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

async function run() {
  console.log('Scanning for approved LineRejects missing StockMutation...');
  
  const rejects = await db.lineReject.findMany({
    where: { status: 'approved' }
  });

  let fixed = 0;

  for (const reject of rejects) {
    const barcodeFragment = `REJECT-${reject.id.substring(0, 8)}`;
    
    const existing = await db.stockMutation.findFirst({
      where: {
        source: 'LINE_REJECT',
        barcode: barcodeFragment
      }
    });

    if (!existing) {
      let uom = "PCS"; // Default UOM

      const timeStr = nowTimeStr();
      
      await db.stockMutation.create({
        data: {
          date: reject.date, // Use the date of the reject
          time: new Date(`1970-01-01T${timeStr.length === 5 ? timeStr + ":00" : timeStr}Z`),
          type: "OUT",
          source: "LINE_REJECT",
          materialName: reject.materialName,
          qty: String(reject.pcs),
          uom,
          line: reject.line,
          skuId: "-",
          barcode: barcodeFragment
        }
      });
      console.log(`- Fixed missing mutation for Reject ID: ${reject.id} (${reject.materialName} - ${reject.pcs} pcs)`);
      fixed++;
    }
  }

  console.log(`Done. Fixed ${fixed} missing mutations.`);
  await db.$disconnect();
}

run().catch(console.error);
