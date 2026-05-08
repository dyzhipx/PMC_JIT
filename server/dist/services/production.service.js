import { db } from "../config/database.js";
import * as masterService from "./master.service.js";
import * as transitService from "./transit.service.js";
import { todayStr, nowTimeStr } from "../utils/format.js";
import { broadcastEvent } from "../config/socket.js";
export async function getLineStockAll() { return db.lineStock.findMany(); }
export async function getLineStockByLine(line) { return db.lineStock.findMany({ where: { line } }); }
export async function getLineBarcodes(line) {
    if (line)
        return db.lineBarcode.findMany({ where: { line } });
    return db.lineBarcode.findMany();
}
export async function receiveToLine(line, material, barcode, inputPcs) {
    if (!line || !material || !barcode)
        return { success: false, message: "Line, material, barcode harus diisi." };
    return db.$transaction(async (tx) => {
        const inv = await tx.transitInventory.findFirst({ where: { barcode, materialName: material } });
        if (!inv)
            return { success: false, message: `Barcode ${barcode} tidak di transit untuk ${material}.` };
        // STRICT VALIDATION
        const lastInMutation = await tx.stockMutation.findFirst({
            where: { barcode, type: "IN", materialName: material },
            orderBy: { createdAt: "desc" }
        });
        if (lastInMutation) {
            const expectedPcs = parseFloat(String(lastInMutation.qty));
            if (inputPcs !== expectedPcs) {
                return { success: false, message: `Coba cek kembali jumlah Qty, seharusnya sesuai data Barcode yaitu (${expectedPcs})` };
            }
        }
        // Deduct from transit (passing tx client and barcode)
        const takeResult = await transitService.takeFromTransit(material, 1, `Produksi Line ${line}`, inputPcs, tx, barcode);
        if (!takeResult.success)
            return takeResult;
        // Upsert line stock
        const existing = await tx.lineStock.findFirst({ where: { line, materialName: material } });
        if (existing) {
            await tx.lineStock.update({
                where: { id: existing.id },
                data: { qtyPallets: existing.qtyPallets + 1, pcs: String(parseFloat(String(existing.pcs || "0")) + inputPcs) }
            });
        }
        else {
            await tx.lineStock.create({ data: { line, materialName: material, qtyPallets: 1, pcs: String(inputPcs) } });
        }
        const timeInStr = nowTimeStr();
        await tx.lineBarcode.create({
            data: {
                barcode,
                materialName: material,
                line,
                pcs: String(inputPcs),
                supplier: inv.supplier,
                dateIn: new Date(todayStr()),
                timeIn: new Date(`1970-01-01T${timeInStr.length === 5 ? timeInStr + ":00" : timeInStr}Z`)
            }
        });
        broadcastEvent('line_stock_updated', { source: 'receiveToLine', line, material });
        return { success: true, message: `Barcode ${barcode} diterima di Line ${line}.` };
    }, {
        maxWait: 5000,
        timeout: 20000,
    });
}
export async function receivePartialToLine(line, material, barcode, partialPcs) {
    if (!line || !material || !barcode || partialPcs <= 0)
        return { success: false, message: "Line, material, barcode, dan qty harus valid." };
    return db.$transaction(async (tx) => {
        const inv = await tx.transitInventory.findFirst({ where: { barcode, materialName: material } });
        if (!inv)
            return { success: false, message: `Barcode ${barcode} tidak di transit untuk ${material}.` };
        // Find original available pcs
        let availablePcs = 0;
        if (inv.pcs) {
            availablePcs = parseFloat(String(inv.pcs));
        }
        else {
            const lastInMutation = await tx.stockMutation.findFirst({
                where: { barcode, type: "IN", materialName: material },
                orderBy: { createdAt: "desc" }
            });
            if (lastInMutation)
                availablePcs = parseFloat(String(lastInMutation.qty));
        }
        if (partialPcs > availablePcs) {
            return { success: false, message: `Gagal: Qty diambil (${partialPcs}) melebihi stok di barcode (${availablePcs}).` };
        }
        // Deduct from transit stock live
        if (inv.blockRowId) {
            const live = await tx.transitStockLive.findFirst({ where: { blockRowId: inv.blockRowId, materialName: material } });
            if (live) {
                const newPcs = Math.max(0, parseFloat(String(live.pcs || "0")) - partialPcs);
                await tx.transitStockLive.update({
                    where: { id: live.id },
                    data: { pcs: String(newPcs) }
                });
            }
        }
        // Validate remaining detail inventory pcs
        const newInvPcs = availablePcs - partialPcs;
        if (newInvPcs <= 0) {
            await tx.transitInventory.delete({ where: { id: inv.id } });
            // Because the barcode is empty, we must deduct the pallet count from live stock
            if (inv.blockRowId) {
                const live = await tx.transitStockLive.findFirst({ where: { blockRowId: inv.blockRowId, materialName: material } });
                if (live) {
                    const newPallets = Math.max(0, live.qtyPallets - inv.palletsAvailable);
                    await tx.transitStockLive.update({ where: { id: live.id }, data: { qtyPallets: newPallets } });
                }
            }
        }
        else {
            await tx.transitInventory.update({
                where: { id: inv.id },
                data: { pcs: String(newInvPcs) }
            });
        }
        const timeInStr = nowTimeStr();
        const uom = await masterService.getMaterialUOM(material, tx);
        // Create mutation record
        await tx.stockMutation.create({
            data: {
                date: new Date(todayStr()),
                time: new Date(`1970-01-01T${timeInStr.length === 5 ? timeInStr + ":00" : timeInStr}Z`),
                type: "OUT",
                source: "PRODUCTION",
                materialName: material,
                qty: String(partialPcs),
                uom: uom,
                line: `Produksi Line ${line} (Recehan)`,
                skuId: "-",
                barcode: barcode,
                blockId: inv.blockId,
                blockRowId: inv.blockRowId
            }
        });
        // Add to Line Stock (no pallet increment because partial)
        const existing = await tx.lineStock.findFirst({ where: { line, materialName: material } });
        if (existing) {
            await tx.lineStock.update({
                where: { id: existing.id },
                data: { pcs: String(parseFloat(String(existing.pcs || "0")) + partialPcs) }
            });
        }
        else {
            await tx.lineStock.create({ data: { line, materialName: material, qtyPallets: 0, pcs: String(partialPcs) } });
        }
        // Generate virtual barcode for line tracking
        const prefix = `${barcode}-P`;
        const existingSplits = await tx.lineBarcode.count({
            where: { barcode: { startsWith: prefix } }
        });
        const virtualBarcode = `${barcode}-P${existingSplits + 1}`;
        await tx.lineBarcode.create({
            data: {
                barcode: virtualBarcode,
                materialName: material,
                line,
                pcs: String(partialPcs),
                supplier: inv.supplier,
                dateIn: new Date(todayStr()),
                timeIn: new Date(`1970-01-01T${timeInStr.length === 5 ? timeInStr + ":00" : timeInStr}Z`)
            }
        });
        broadcastEvent('line_stock_updated', { source: 'receivePartialToLine', line, material });
        return { success: true, message: `Recehan (${partialPcs} pcs) dari barcode ${barcode} diterima di Line ${line}.` };
    }, {
        maxWait: 5000,
        timeout: 20000,
    });
}
export async function returnFromLine(barcode, pcsOverride, targetBlockRowId, condition = "utuh") {
    if (!barcode)
        return { success: false, message: "Barcode harus diisi." };
    return db.$transaction(async (tx) => {
        const bcd = await tx.lineBarcode.findFirst({ where: { barcode } });
        if (!bcd)
            return { success: false, message: `Barcode ${barcode} tidak ditemukan di line.` };
        const actualPcs = pcsOverride !== undefined && pcsOverride !== null ? pcsOverride : parseFloat(String(bcd.pcs || "0"));
        // Deduct from line stock
        const ls = await tx.lineStock.findFirst({ where: { line: bcd.line, materialName: bcd.materialName } });
        if (ls) {
            const newQty = Math.max(0, ls.qtyPallets - 1);
            const newPcs = Math.max(0, parseFloat(String(ls.pcs || "0")) - actualPcs);
            if (newQty === 0 && newPcs === 0)
                await tx.lineStock.delete({ where: { id: ls.id } });
            else
                await tx.lineStock.update({ where: { id: ls.id }, data: { qtyPallets: newQty, pcs: String(newPcs) } });
        }
        await tx.lineBarcode.delete({ where: { id: bcd.id } });
        // Remove barcode from used_barcodes so it can be re-scanned at transit inbound
        await tx.usedBarcode.deleteMany({ where: { barcode } });
        const timeInStr = nowTimeStr();
        await tx.pendingReturn.create({
            data: {
                barcode,
                materialName: bcd.materialName,
                line: bcd.line,
                pcs: String(actualPcs),
                supplier: bcd.supplier,
                date: new Date(todayStr()),
                time: new Date(`1970-01-01T${timeInStr.length === 5 ? timeInStr + ":00" : timeInStr}Z`),
                status: "pending",
                targetBlockRowId: targetBlockRowId || null,
                condition: condition || "utuh"
            }
        });
        return { success: true, message: `Retur barcode ${barcode} (${condition === "sisa" ? "SISA" : "UTUH"} - ${actualPcs} pcs) menunggu verifikasi Transit.` };
    }, { timeout: 20000 });
}
export async function returnSisaFromLine(line, materialName, pcs, targetBlockRowId) {
    if (!line || !materialName || !pcs || pcs <= 0)
        return { success: false, message: "Line, material, dan qty harus valid." };
    return db.$transaction(async (tx) => {
        // Verify stock exists in line
        const ls = await tx.lineStock.findFirst({ where: { line, materialName } });
        if (!ls)
            return { success: false, message: `Tidak ada stok ${materialName} di Line ${line}.` };
        const currentPcs = parseFloat(String(ls.pcs || "0"));
        if (pcs > currentPcs)
            return { success: false, message: `Qty retur (${pcs}) melebihi stok line (${currentPcs}).` };
        // Generate virtual barcode
        const ts = Date.now().toString(36).toUpperCase();
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        const virtualBarcode = `SISA-${line}-${ts}-${rand}`;
        // Deduct from lineStock directly (no pallet decrement since sisa is loose)
        const newPcs = currentPcs - pcs;
        if (newPcs <= 0 && ls.qtyPallets <= 0) {
            await tx.lineStock.delete({ where: { id: ls.id } });
        }
        else {
            await tx.lineStock.update({
                where: { id: ls.id },
                data: { pcs: String(Math.max(0, newPcs)) }
            });
        }
        const timeInStr = nowTimeStr();
        await tx.pendingReturn.create({
            data: {
                barcode: virtualBarcode,
                materialName,
                line,
                pcs: String(pcs),
                supplier: "-",
                date: new Date(todayStr()),
                time: new Date(`1970-01-01T${timeInStr.length === 5 ? timeInStr + ":00" : timeInStr}Z`),
                status: "pending",
                targetBlockRowId: targetBlockRowId || null,
                condition: "sisa"
            }
        });
        return { success: true, message: `Retur SISA ${materialName} (${pcs} pcs) dari Line ${line} menunggu verifikasi Transit. Barcode virtual: ${virtualBarcode}` };
    }, { timeout: 20000 });
}
export async function getPendingReturns() { return db.pendingReturn.findMany({ where: { status: "pending" } }); }
export async function verifyReturn(id, action) {
    return db.$transaction(async (tx) => {
        const ret = await tx.pendingReturn.findUnique({ where: { id } });
        if (!ret)
            return { success: false, message: "Data retur tidak ditemukan." };
        const pcs = parseFloat(String(ret.pcs || "0"));
        if (action === "accept") {
            // Pass tx to receiveToTransit to ensure transaction safety and let it handle everything
            const res = await transitService.receiveToTransit(ret.materialName, 1, ret.barcode, pcs, `Line ${ret.line} -> Transit (Retur${ret.condition === "sisa" ? " SISA" : ""})`, ret.targetBlockRowId || undefined, ret.supplier || "-", tx);
            if (!res.success)
                return res;
            await tx.pendingReturn.update({ where: { id }, data: { status: "accepted" } });
            return { success: true, message: `Retur ${ret.barcode} masuk Transit.` };
        }
        else {
            // Reject - return to line
            const ls = await tx.lineStock.findFirst({ where: { line: ret.line, materialName: ret.materialName } });
            if (ls)
                await tx.lineStock.update({ where: { id: ls.id }, data: { qtyPallets: ls.qtyPallets + 1, pcs: String(parseFloat(String(ls.pcs || "0")) + pcs) } });
            else
                await tx.lineStock.create({ data: { line: ret.line, materialName: ret.materialName, qtyPallets: 1, pcs: String(pcs) } });
            await tx.lineBarcode.create({ data: { barcode: ret.barcode, materialName: ret.materialName, line: ret.line, pcs: ret.pcs, supplier: ret.supplier, dateIn: ret.date, timeIn: ret.time } });
            await tx.pendingReturn.update({ where: { id }, data: { status: "rejected" } });
            return { success: true, message: `Retur ${ret.barcode} ditolak, kembali ke Line ${ret.line}.` };
        }
    }, { timeout: 20000 });
}
export async function getExternalOnhand(dest) {
    const stock = await db.externalOnhand.findMany({ where: { destination: dest } });
    const barcodes = await db.externalOnhandBarcode.findMany({ where: { destination: dest } });
    return { stock, barcodes };
}
export async function processLineReject(line, materialName, pcsInput, reason) {
    if (!line || !materialName || !pcsInput || !reason)
        return { success: false, message: "Lengkapi data rijek." };
    return db.$transaction(async (tx) => {
        // Just verify if the stock exists in the line
        const ls = await tx.lineStock.findFirst({ where: { line, materialName } });
        if (!ls)
            return { success: false, message: `Tidak ada stok ${materialName} di Line ${line}.` };
        const actualPcs = parseFloat(String(ls.pcs || "0"));
        if (pcsInput > actualPcs)
            return { success: false, message: `Gagal: Total stok ${materialName} di line ini hanya ${actualPcs} PCS` };
        const timeInStr = nowTimeStr();
        await tx.lineReject.create({
            data: {
                line,
                materialName,
                pcs: String(pcsInput),
                reason,
                status: "pending",
                date: new Date(todayStr()),
                time: new Date(`1970-01-01T${timeInStr.length === 5 ? timeInStr + ":00" : timeInStr}Z`),
            }
        });
        return { success: true, message: `Berhasil mengajukan rijek ${pcsInput} pcs (${reason}) dari Line ${line}. Menunggu verifikasi Transit.` };
    }, { timeout: 20000 });
}
export async function verifyLineReject(id, action, finalPcs) {
    return db.$transaction(async (tx) => {
        const reject = await tx.lineReject.findUnique({ where: { id } });
        if (!reject)
            return { success: false, message: "Data pengajuan rijek tidak ditemukan." };
        if (reject.status !== "pending")
            return { success: false, message: `Verifikasi ditolak: Status sudah ${reject.status}.` };
        const pcsToDeduct = finalPcs !== undefined && finalPcs > 0 ? finalPcs : parseFloat(String(reject.pcs || "0"));
        if (action === "reject") {
            await tx.lineReject.update({ where: { id }, data: { status: "rejected" } });
            return { success: true, message: `Pengajuan rijek ditolak.` };
        }
        // Action == "accept"
        // Deduct from LineStock
        const ls = await tx.lineStock.findFirst({ where: { line: reject.line, materialName: reject.materialName } });
        if (!ls)
            return { success: false, message: `Gagal diproses: Stok ${reject.materialName} sudah kosong di Line ${reject.line}.` };
        const currentLinePcs = parseFloat(String(ls.pcs || "0"));
        if (pcsToDeduct > currentLinePcs) {
            return { success: false, message: `Gagal: Stok line tersisa (${currentLinePcs}) lebih kecil dari jumlah yang disetujui (${pcsToDeduct}).` };
        }
        let remainingToDeduct = pcsToDeduct;
        // Fetch line barcodes ordered by oldest first (FIFO)
        const barcodes = await tx.lineBarcode.findMany({
            where: { line: reject.line, materialName: reject.materialName },
            orderBy: { timeIn: "asc" }
        });
        let palletsDeducted = 0;
        for (const bcd of barcodes) {
            if (remainingToDeduct <= 0)
                break;
            const barcodePcs = parseFloat(String(bcd.pcs || "0"));
            if (barcodePcs <= remainingToDeduct) {
                // Delete this barcode entirely
                remainingToDeduct -= barcodePcs;
                palletsDeducted += 1;
                await tx.lineBarcode.delete({ where: { id: bcd.id } });
            }
            else {
                // Partially deduct
                const updatedPcs = barcodePcs - remainingToDeduct;
                await tx.lineBarcode.update({
                    where: { id: bcd.id },
                    data: { pcs: String(updatedPcs) }
                });
                remainingToDeduct = 0;
            }
        }
        const newLinePcs = currentLinePcs - pcsToDeduct;
        const newQtyPallets = Math.max(0, ls.qtyPallets - palletsDeducted);
        if (newQtyPallets === 0 && newLinePcs === 0) {
            await tx.lineStock.delete({ where: { id: ls.id } });
        }
        else {
            await tx.lineStock.update({
                where: { id: ls.id },
                data: { qtyPallets: newQtyPallets, pcs: String(newLinePcs) }
            });
        }
        // Update LineReject status to approved and update the pcs if it was changed
        await tx.lineReject.update({
            where: { id },
            data: { status: "approved", pcs: String(pcsToDeduct) }
        });
        const uom = await masterService.getMaterialUOM(reject.materialName, tx);
        const timeStr = nowTimeStr();
        await tx.stockMutation.create({
            data: {
                date: new Date(todayStr()),
                time: new Date(`1970-01-01T${timeStr.length === 5 ? timeStr + ":00" : timeStr}Z`),
                type: "OUT",
                source: "LINE_REJECT",
                materialName: reject.materialName,
                qty: String(pcsToDeduct),
                uom,
                line: reject.line,
                skuId: "-",
                barcode: `REJECT-${reject.id.substring(0, 8)}`
            }
        });
        return { success: true, message: `Pengajuan rijek disetujui. Stok line terpotong ${pcsToDeduct} PCS.` };
    }, { timeout: 20000 });
}
export async function getLineRejects(dateStr) {
    const dateObj = dateStr ? new Date(dateStr) : new Date(todayStr());
    return db.lineReject.findMany({
        where: { date: dateObj },
        orderBy: [{ time: "desc" }]
    });
}
// ═══════════════════════════════════════════
//  PRODUCTION OPNAME (STOCK CHECK FOR LINE)
// ═══════════════════════════════════════════
export async function saveLineOpname(data) {
    return db.$transaction(async (tx) => {
        const opname = await tx.productionOpname.create({
            data: {
                date: new Date(data.date),
                type: data.type,
                line: data.line,
                checkedBy: data.checkedBy || null,
                notes: data.notes || null,
            }
        });
        const timeStr = nowTimeStr();
        const items = [];
        for (const item of data.items) {
            const delta = item.qtyPhysical - item.qtyBook;
            const opnameItem = await tx.productionOpnameItem.create({
                data: {
                    productionOpnameId: opname.id,
                    materialName: item.materialName,
                    qtyBook: item.qtyBook,
                    qtyPhysical: item.qtyPhysical,
                    delta,
                    calculatorNotes: item.calculatorNotes || null
                }
            });
            items.push(opnameItem);
            // Skip if no difference
            if (Math.abs(delta) < 0.0001)
                continue;
            // Sync LineStock to match physical count
            const ls = await tx.lineStock.findFirst({
                where: { line: data.line, materialName: item.materialName }
            });
            if (ls) {
                const newPcs = item.qtyPhysical;
                if (newPcs <= 0) {
                    await tx.lineStock.delete({ where: { id: ls.id } });
                }
                else {
                    await tx.lineStock.update({
                        where: { id: ls.id },
                        data: { pcs: String(newPcs) }
                    });
                }
            }
            else if (item.qtyPhysical > 0) {
                await tx.lineStock.create({
                    data: {
                        line: data.line,
                        materialName: item.materialName,
                        qtyPallets: 0,
                        pcs: String(item.qtyPhysical)
                    }
                });
            }
            // Record stock mutation for the adjustment
            await tx.stockMutation.create({
                data: {
                    date: new Date(data.date),
                    time: new Date(`1970-01-01T${timeStr.length === 5 ? timeStr + ":00" : timeStr}Z`),
                    type: "ADJUST",
                    source: "LINE_OPNAME",
                    materialName: item.materialName,
                    qty: String(delta),
                    uom: "PCS",
                    line: `Opname ${data.type} - ${data.line}`,
                    skuId: "-",
                    barcode: `OPNAME-${opname.id.substring(0, 8)}`
                }
            });
        }
        return { success: true, opname, items };
    }, { timeout: 30000 });
}
export async function getLineOpnames(filters) {
    const where = {};
    if (filters?.line)
        where.line = filters.line;
    if (filters?.type)
        where.type = filters.type;
    if (filters?.startDate && filters?.endDate) {
        where.date = { gte: new Date(filters.startDate), lte: new Date(filters.endDate) };
    }
    else if (filters?.startDate) {
        where.date = { gte: new Date(filters.startDate) };
    }
    else if (filters?.endDate) {
        where.date = { lte: new Date(filters.endDate) };
    }
    return db.productionOpname.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: "desc" }
    });
}
export async function updateLineOpnameItem(opnameId, itemId, newQtyPhysical, editedBy) {
    return db.$transaction(async (tx) => {
        // 1. Get the opname and its item
        const opname = await tx.productionOpname.findUnique({ where: { id: opnameId } });
        if (!opname)
            throw new Error('Opname not found');
        const item = await tx.productionOpnameItem.findUnique({ where: { id: itemId } });
        if (!item)
            throw new Error('Opname item not found');
        const oldPhysical = parseFloat(item.qtyPhysical);
        const qtyBook = parseFloat(item.qtyBook);
        const newDelta = newQtyPhysical - qtyBook;
        const adjustmentDelta = newQtyPhysical - oldPhysical; // difference from old physical
        // 2. Update the opname item
        await tx.productionOpnameItem.update({
            where: { id: itemId },
            data: {
                qtyPhysical: newQtyPhysical,
                delta: newDelta,
                calculatorNotes: (item.calculatorNotes || '') + ` [EDIT by ${editedBy}: ${oldPhysical} → ${newQtyPhysical}]`
            }
        });
        // 3. Re-sync LineStock
        if (Math.abs(adjustmentDelta) > 0.0001) {
            const ls = await tx.lineStock.findFirst({
                where: { line: opname.line, materialName: item.materialName }
            });
            if (ls) {
                const currentPcs = parseFloat(ls.pcs || '0');
                const newPcs = currentPcs + adjustmentDelta;
                if (newPcs <= 0) {
                    await tx.lineStock.delete({ where: { id: ls.id } });
                }
                else {
                    await tx.lineStock.update({
                        where: { id: ls.id },
                        data: { pcs: String(newPcs) }
                    });
                }
            }
            else if (newQtyPhysical > 0) {
                await tx.lineStock.create({
                    data: {
                        line: opname.line,
                        materialName: item.materialName,
                        qtyPallets: 0,
                        pcs: String(newQtyPhysical)
                    }
                });
            }
            // 4. Record correction mutation
            const timeStr = nowTimeStr();
            await tx.stockMutation.create({
                data: {
                    date: opname.date,
                    time: new Date(`1970-01-01T${timeStr.length === 5 ? timeStr + ":00" : timeStr}Z`),
                    type: "ADJUST",
                    source: "LINE_OPNAME",
                    materialName: item.materialName,
                    qty: String(adjustmentDelta),
                    uom: "PCS",
                    line: `Koreksi Opname - ${opname.line} (by ${editedBy})`,
                    skuId: "-",
                    barcode: `OPNAME-EDIT-${opnameId.substring(0, 8)}`
                }
            });
        }
        return { success: true, message: 'Item opname berhasil diperbarui' };
    }, { timeout: 30000 });
}
export async function getLineMutations(filters = {}, page = 1, limit = 50) {
    const where = {};
    if (filters?.material && filters.material !== "ALL")
        where.materialName = filters.material;
    if (filters?.line && filters.line !== "ALL")
        where.line = { contains: filters.line };
    if (filters?.startDate && filters?.endDate) {
        where.date = { gte: new Date(filters.startDate), lte: new Date(filters.endDate) };
    }
    else if (filters?.startDate) {
        where.date = { gte: new Date(filters.startDate) };
    }
    else if (filters?.endDate) {
        where.date = { lte: new Date(filters.endDate) };
    }
    where.OR = [
        { source: "PRODUCTION" },
        { source: "PROD_BPP" },
        { source: "LINE_OPNAME" },
        { source: "RETURN_FULL" },
        { source: "RETURN_PARTIAL" },
        { source: "LINE_REJECT" },
        { source: { contains: "LINE" } }
    ];
    const skip = (page - 1) * limit;
    const [data, totalCount] = await Promise.all([
        db.stockMutation.findMany({
            where,
            orderBy: [{ date: "desc" }, { time: "desc" }],
            skip,
            take: limit
        }),
        db.stockMutation.count({ where })
    ]);
    return {
        data,
        metadata: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page
        }
    };
}
