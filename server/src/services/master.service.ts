import { db } from "../config/database.js";

// ═══════════════════════════════════════════
//  SKU CRUD
// ═══════════════════════════════════════════
export async function getAllSkus() {
  return db.sku.findMany({ orderBy: { code: 'asc' } });
}

export async function getSkuById(id: string) {
  return db.sku.findUnique({ where: { id } });
}

export async function getSkuByCode(code: string) {
  return db.sku.findUnique({ where: { code } });
}

export async function createSku(data: { code: string; name: string; category?: string; uom?: string; supplierId?: string }) {
  return db.sku.create({ data });
}

export async function updateSku(id: string, data: Partial<{ code: string; name: string; category: string; uom: string; supplierId: string }>) {
  return db.sku.update({ where: { id }, data: { ...data, updatedAt: new Date() } });
}

export async function deleteSku(id: string) {
  await db.sku.delete({ where: { id } });
}

// ═══════════════════════════════════════════
//  BOM CRUD
// ═══════════════════════════════════════════
export async function getAllBoms() {
  return db.bomComponent.findMany({
    orderBy: [
      { skuId: 'asc' },
      { sortOrder: 'asc' }
    ]
  });
}

export async function getBomBySkuId(skuId: string) {
  return db.bomComponent.findMany({
    where: { skuId },
    orderBy: { sortOrder: 'asc' }
  });
}

export async function addBomComponent(skuId: string, data: {
  materialName: string;
  coefficient: any;
  uom: string;
  rounding?: string;
  oracleCode?: string;
  line?: string;
  sortOrder?: number;
}) {
  return db.bomComponent.create({ data: { skuId, ...data } });
}

export async function updateBomComponent(id: string, data: Partial<{
  materialName: string;
  coefficient: any;
  uom: string;
  rounding: string;
  oracleCode: string;
  sortOrder: number;
}>) {
  return db.bomComponent.update({ where: { id }, data });
}

export async function deleteBomComponent(id: string) {
  await db.bomComponent.delete({ where: { id } });
}

// ═══════════════════════════════════════════
//  SUPPLIER CRUD
// ═══════════════════════════════════════════
export async function getAllSuppliers() {
  return db.supplier.findMany({ orderBy: { code: 'asc' } });
}

export async function createSupplier(data: { code: string; name: string; contact?: string; address?: string }) {
  return db.supplier.create({ data });
}

export async function updateSupplier(id: string, data: Partial<{ code: string; name: string; contact: string; address: string }>) {
  return db.supplier.update({ where: { id }, data });
}

export async function deleteSupplier(id: string) {
  await db.supplier.delete({ where: { id } });
}

// ═══════════════════════════════════════════
//  LINE-SKU MAPPING
// ═══════════════════════════════════════════
export async function getAllLineSkuMappings() {
  return db.lineSkuMapping.findMany();
}

export async function getLinesForSku(skuId: string) {
  const rows = await db.lineSkuMapping.findMany({ where: { skuId } });
  return rows.map((r: any) => r.line);
}

export async function getSkusForLine(line: string) {
  const rows = await db.lineSkuMapping.findMany({ where: { line } });
  return rows.map((r: any) => r.skuId);
}

export async function addLineSkuMapping(skuId: string, line: string) {
  const existing = await db.lineSkuMapping.findUnique({
    where: {
      uq_line_sku: { skuId, line }
    }
  });
  if (existing) return existing;
  return db.lineSkuMapping.create({ data: { skuId, line } });
}

export async function deleteLineSkuMapping(skuId: string, line: string) {
  await db.lineSkuMapping.delete({
    where: {
      uq_line_sku: { skuId, line }
    }
  });
}

// ═══════════════════════════════════════════
//  PALLET QTY CONFIG
// ═══════════════════════════════════════════
export async function getAllPalletQty(tx?: any) {
  return (tx || db).palletQtyConfig.findMany();
}

export async function getPalletQty(materialName: string, tx?: any): Promise<number> {
  const config = await (tx || db).palletQtyConfig.findUnique({ where: { materialName } });
  return config?.qtyPerPallet ?? 1;
}

export async function setPalletQty(materialName: string, qtyPerPallet: number) {
  return db.palletQtyConfig.upsert({
    where: { materialName },
    update: { qtyPerPallet },
    create: { materialName, qtyPerPallet }
  });
}

// ═══════════════════════════════════════════
//  UOM CONVERSIONS
// ═══════════════════════════════════════════
export async function getAllUom() {
  return db.uomConversion.findMany();
}

// ═══════════════════════════════════════════
//  BLOCK LAYOUT
// ═══════════════════════════════════════════
export async function getFullBlockLayout(tx?: any) {
  const client = tx || db;
  const blocks = await client.blockLayout.findMany({
    orderBy: { blockNumber: 'asc' },
    include: {
      blockRows: {
        orderBy: { rowNumber: 'asc' }
      }
    }
  });

  return blocks.map((block: any) => {
    const { blockRows, ...rest } = block;
    let parsedCategories = [];
    try {
      parsedCategories = block.skuCategories ? JSON.parse(block.skuCategories) : [];
    } catch(e) {}
    return {
      ...rest,
      skuCategories: parsedCategories,
      rows: blockRows.map((r: any) => ({
        ...r,
        assignedLines: r.assignedLines ? JSON.parse(r.assignedLines) : []
      }))
    };
  });
}

export async function saveFullBlockLayout(layout: Array<{
  blockNumber: number;
  skuCategories?: string[];
  rows: Array<{
    rowNumber: number;
    materialName: string;
    maxPallets: number;
    assignedLines?: string[];
    isFlexible?: boolean;
  }>;
}>) {
  return db.$transaction(async (tx: any) => {
    // Collect existing blocks to compare
    const existingBlocks = await tx.blockLayout.findMany({ include: { blockRows: true } });
    
    const activeBlockIds: string[] = [];
    const activeRowIds: string[] = [];

    for (let i = 0; i < layout.length; i++) {
      const block = layout[i];
      let dbBlock = existingBlocks.find((b: any) => b.blockNumber === block.blockNumber);
      
      if (dbBlock) {
        dbBlock = await tx.blockLayout.update({
          where: { id: dbBlock.id },
          data: { skuCategories: block.skuCategories ? JSON.stringify(block.skuCategories) : null, sortOrder: i }
        });
      } else {
        dbBlock = await tx.blockLayout.create({
          data: {
            blockNumber: block.blockNumber,
            skuCategories: block.skuCategories ? JSON.stringify(block.skuCategories) : null,
            sortOrder: i,
          }
        });
      }
      activeBlockIds.push(dbBlock.id);

      for (const row of block.rows) {
        const assignedText = row.assignedLines ? JSON.stringify(row.assignedLines) : null;
        let dbRow = await tx.blockRow.findFirst({
           where: { blockId: dbBlock.id, rowNumber: row.rowNumber }
        });

        if (dbRow) {
           dbRow = await tx.blockRow.update({
              where: { id: dbRow.id },
              data: {
                 materialName: row.materialName || "",
                 maxPallets: row.maxPallets || 4,
                 assignedLines: assignedText,
                 isFlexible: row.isFlexible || false
              }
           });
        } else {
           dbRow = await tx.blockRow.create({
              data: {
                blockId: dbBlock.id,
                rowNumber: row.rowNumber,
                materialName: row.materialName || "",
                maxPallets: row.maxPallets || 4,
                assignedLines: assignedText,
              }
           });
        }
        activeRowIds.push(dbRow.id);
      }
    }

    // Attempt to delete rows and blocks that were removed by the user.
    // If a removed row is referenced by operational Stock/Scans, this deleteMany will throw 
    // a constraint error and the transaction will safely rollback, communicating the error 
    // downstream safely via Express try/catch.
    await tx.blockRow.deleteMany({
      where: { id: { notIn: activeRowIds } }
    });

    await tx.blockLayout.deleteMany({
      where: { id: { notIn: activeBlockIds } }
    });

  }, {
    maxWait: 5000, 
    timeout: 20000, 
  });
}

/**
 * Get material UOM from BOM data.
 */
export async function getMaterialUOM(materialName: string, tx?: any): Promise<string> {
  const comp = await (tx || db).bomComponent.findFirst({
    where: { materialName },
    select: { uom: true }
  });
  return comp?.uom || "PCS";
}

// ═══════════════════════════════════════════
//  MATERIAL RECEH CRUD
// ═══════════════════════════════════════════
export async function getMaterialReceh() {
  return db.materialReceh.findMany({ orderBy: { materialName: 'asc' } });
}

export async function addMaterialReceh(materialName: string) {
  const existing = await db.materialReceh.findUnique({ where: { materialName } });
  if (existing) return { success: false, message: 'Material tersebut sudah ada di dalam list Receh.' };
  await db.materialReceh.create({ data: { materialName } });
  return { success: true, message: 'Berhasil ditambahkan ke daftar Material Receh.' };
}

export async function removeMaterialReceh(materialName: string) {
  await db.materialReceh.delete({ where: { materialName } });
  return { success: true, message: 'Berhasil dihapus dari daftar.' };
}

// ═══════════════════════════════════════════
//  KAMUS OPNAME CRUD
// ═══════════════════════════════════════════
export async function getAllKamusOpname() {
  return db.kamusOpname.findMany({ orderBy: { materialName: 'asc' } });
}

export async function createKamusOpname(data: {
  materialName: string;
  oracleCode?: string;
  beratRollUtuh?: number;
  beratCore?: number;
  jumlahSachet?: number;
}) {
  return db.kamusOpname.create({
    data: {
      materialName: data.materialName,
      oracleCode: data.oracleCode || null,
      beratRollUtuh: data.beratRollUtuh ?? null,
      beratCore: data.beratCore ?? null,
      jumlahSachet: data.jumlahSachet ?? null,
    }
  });
}

export async function updateKamusOpname(id: string, data: Partial<{
  materialName: string;
  oracleCode: string;
  beratRollUtuh: number;
  beratCore: number;
  jumlahSachet: number;
}>) {
  return db.kamusOpname.update({
    where: { id },
    data: { ...data, updatedAt: new Date() }
  });
}

export async function deleteKamusOpname(id: string) {
  await db.kamusOpname.delete({ where: { id } });
}

export async function deleteMultipleKamusOpname(ids: string[]) {
  await db.kamusOpname.deleteMany({ where: { id: { in: ids } } });
  return { success: true, message: `${ids.length} item berhasil dihapus.` };
}

