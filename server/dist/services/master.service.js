import { db } from "../config/database.js";
// ═══════════════════════════════════════════
//  SKU CRUD
// ═══════════════════════════════════════════
export async function getAllSkus() {
    return db.sku.findMany({ orderBy: { code: 'asc' } });
}
export async function getSkuById(id) {
    return db.sku.findUnique({ where: { id } });
}
export async function getSkuByCode(code) {
    return db.sku.findUnique({ where: { code } });
}
export async function createSku(data) {
    return db.sku.create({ data });
}
export async function updateSku(id, data) {
    return db.sku.update({ where: { id }, data: { ...data, updatedAt: new Date() } });
}
export async function deleteSku(id) {
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
export async function getBomBySkuId(skuId) {
    return db.bomComponent.findMany({
        where: { skuId },
        orderBy: { sortOrder: 'asc' }
    });
}
export async function addBomComponent(skuId, data) {
    return db.bomComponent.create({ data: { skuId, ...data } });
}
export async function updateBomComponent(id, data) {
    return db.bomComponent.update({ where: { id }, data });
}
export async function deleteBomComponent(id) {
    await db.bomComponent.delete({ where: { id } });
}
// ═══════════════════════════════════════════
//  SUPPLIER CRUD
// ═══════════════════════════════════════════
export async function getAllSuppliers() {
    return db.supplier.findMany({ orderBy: { code: 'asc' } });
}
export async function createSupplier(data) {
    return db.supplier.create({ data });
}
export async function updateSupplier(id, data) {
    return db.supplier.update({ where: { id }, data });
}
export async function deleteSupplier(id) {
    await db.supplier.delete({ where: { id } });
}
// ═══════════════════════════════════════════
//  LINE-SKU MAPPING
// ═══════════════════════════════════════════
export async function getAllLineSkuMappings() {
    return db.lineSkuMapping.findMany();
}
export async function getLinesForSku(skuId) {
    const rows = await db.lineSkuMapping.findMany({ where: { skuId } });
    return rows.map((r) => r.line);
}
export async function getSkusForLine(line) {
    const rows = await db.lineSkuMapping.findMany({ where: { line } });
    return rows.map((r) => r.skuId);
}
export async function addLineSkuMapping(skuId, line) {
    const existing = await db.lineSkuMapping.findUnique({
        where: {
            uq_line_sku: { skuId, line }
        }
    });
    if (existing)
        return existing;
    return db.lineSkuMapping.create({ data: { skuId, line } });
}
export async function deleteLineSkuMapping(skuId, line) {
    await db.lineSkuMapping.delete({
        where: {
            uq_line_sku: { skuId, line }
        }
    });
}
// ═══════════════════════════════════════════
//  PALLET QTY CONFIG
// ═══════════════════════════════════════════
export async function getAllPalletQty(tx) {
    return (tx || db).palletQtyConfig.findMany();
}
export async function getPalletQty(materialName, tx) {
    const config = await (tx || db).palletQtyConfig.findUnique({ where: { materialName } });
    return config?.qtyPerPallet ?? 1;
}
export async function setPalletQty(materialName, qtyPerPallet) {
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
export async function getFullBlockLayout(tx) {
    const client = tx || db;
    const blocks = await client.blockLayout.findMany({
        orderBy: { blockNumber: 'asc' },
        include: {
            blockRows: {
                orderBy: { rowNumber: 'asc' }
            }
        }
    });
    return blocks.map((block) => {
        const { blockRows, ...rest } = block;
        let parsedCategories = [];
        try {
            parsedCategories = block.skuCategories ? JSON.parse(block.skuCategories) : [];
        }
        catch (e) { }
        return {
            ...rest,
            skuCategories: parsedCategories,
            rows: blockRows.map((r) => ({
                ...r,
                assignedLines: r.assignedLines ? JSON.parse(r.assignedLines) : []
            }))
        };
    });
}
export async function saveFullBlockLayout(layout) {
    return db.$transaction(async (tx) => {
        // Collect existing blocks to compare
        const existingBlocks = await tx.blockLayout.findMany({ include: { blockRows: true } });
        const activeBlockIds = [];
        const activeRowIds = [];
        for (let i = 0; i < layout.length; i++) {
            const block = layout[i];
            let dbBlock = existingBlocks.find((b) => b.blockNumber === block.blockNumber);
            if (dbBlock) {
                dbBlock = await tx.blockLayout.update({
                    where: { id: dbBlock.id },
                    data: { skuCategories: block.skuCategories ? JSON.stringify(block.skuCategories) : null, sortOrder: i }
                });
            }
            else {
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
                }
                else {
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
export async function getMaterialUOM(materialName, tx) {
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
export async function addMaterialReceh(materialName) {
    const existing = await db.materialReceh.findUnique({ where: { materialName } });
    if (existing)
        return { success: false, message: 'Material tersebut sudah ada di dalam list Receh.' };
    await db.materialReceh.create({ data: { materialName } });
    return { success: true, message: 'Berhasil ditambahkan ke daftar Material Receh.' };
}
export async function removeMaterialReceh(materialName) {
    await db.materialReceh.delete({ where: { materialName } });
    return { success: true, message: 'Berhasil dihapus dari daftar.' };
}
// ═══════════════════════════════════════════
//  KAMUS OPNAME CRUD
// ═══════════════════════════════════════════
export async function getAllKamusOpname() {
    return db.kamusOpname.findMany({ orderBy: { materialName: 'asc' } });
}
export async function createKamusOpname(data) {
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
export async function updateKamusOpname(id, data) {
    return db.kamusOpname.update({
        where: { id },
        data: { ...data, updatedAt: new Date() }
    });
}
export async function deleteKamusOpname(id) {
    await db.kamusOpname.delete({ where: { id } });
}
export async function deleteMultipleKamusOpname(ids) {
    await db.kamusOpname.deleteMany({ where: { id: { in: ids } } });
    return { success: true, message: `${ids.length} item berhasil dihapus.` };
}
