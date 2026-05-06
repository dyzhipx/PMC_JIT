import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function diagnostic() {
  const barcode = '00086';
  
  console.log(`--- Diagnostic for Barcode: ${barcode} ---`);
  
  const wms = await db.warehouseInventory.findUnique({ where: { barcode } });
  console.log('WMS Record:', wms ? JSON.stringify(wms, null, 2) : 'NOT FOUND');
  
  const transit = await db.transitInventory.findFirst({ where: { barcode } });
  console.log('Transit Record:', transit ? JSON.stringify(transit, null, 2) : 'NOT FOUND');

  const scan = await db.deliveryScan.findFirst({ where: { barcode } });
  console.log('Delivery Scan Record:', scan ? JSON.stringify(scan, null, 2) : 'NOT FOUND');

  const pending = await db.transitOutboundPending.findFirst({ where: { barcode } });
  console.log('Pending Outbound (3F1) Record:', pending ? JSON.stringify(pending, null, 2) : 'NOT FOUND');

  await db.$disconnect();
}

diagnostic();
