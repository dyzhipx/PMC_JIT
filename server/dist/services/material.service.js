import { db } from "../config/database.js";
import { applyRounding } from "../utils/rounding.js";
import * as masterService from "./master.service.js";
import * as scheduleService from "./schedule.service.js";
// ═══════════════════════════════════════════
//  STOCK BALANCE FROM STOCK CHECKS
// ═══════════════════════════════════════════
async function sumStockFromCheck(checkDate) {
    const check = await db.stockCheck.findFirst({ where: { checkDate: new Date(checkDate) } });
    if (!check)
        return {};
    const entries = await db.stockCheckEntry.findMany({
        where: { stockCheckId: check.id },
        select: { quantity: true, blockRowId: true }
    });
    // Get block row materials
    const rowIds = [...new Set(entries.map((e) => e.blockRowId))];
    const stockSum = {};
    for (const rowId of rowIds) {
        const row = await db.blockRow.findUnique({ where: { id: rowId } });
        if (!row || !row.materialName)
            continue;
        const rowEntries = entries.filter((e) => e.blockRowId === rowId);
        for (const entry of rowEntries) {
            if (entry.quantity !== null && entry.quantity !== undefined) {
                const val = parseFloat(String(entry.quantity));
                if (!isNaN(val)) {
                    stockSum[row.materialName] = (stockSum[row.materialName] || 0) + val;
                }
            }
        }
    }
    return stockSum;
}
export async function getStockBalanceForDate(date) {
    // Validate date input to prevent RangeError crash
    const testDate = new Date(date + "T00:00:00");
    if (isNaN(testDate.getTime())) {
        console.warn(`[material.service] Invalid date received: "${date}", returning empty stock`);
        return {};
    }
    // Check today's stock first
    const todayStock = await sumStockFromCheck(date);
    if (Object.keys(todayStock).length > 0)
        return todayStock;
    // Look back up to 7 days for carry-over
    for (let i = 1; i <= 7; i++) {
        const d = new Date(date + "T00:00:00");
        d.setDate(d.getDate() - i);
        const prevDate = d.toISOString().split("T")[0];
        const prevStock = await sumStockFromCheck(prevDate);
        if (Object.keys(prevStock).length > 0)
            return prevStock;
    }
    return {};
}
// ═══════════════════════════════════════════
//  WMS FIFO ALLOCATION (projection)
// ═══════════════════════════════════════════
async function allocateFromWMS(material, requiredPcs) {
    if (requiredPcs <= 0)
        return { batches: [], totalSPB: 0 };
    const availableStock = await db.warehouseInventory.findMany({
        where: { materialName: material },
        orderBy: { dateIn: 'asc' }
    });
    let remaining = requiredPcs;
    const batches = [];
    let totalSPB = 0;
    const defaultPalletQty = await masterService.getPalletQty(material);
    for (const batch of availableStock) {
        if (remaining <= 0)
            break;
        if (batch.palletsAvailable <= 0)
            continue;
        const batchQty = batch.qtyPerPallet ? parseFloat(String(batch.qtyPerPallet)) : defaultPalletQty;
        const batchPcs = batchQty * batch.palletsAvailable;
        let palletsToTake;
        if (batchPcs <= remaining) {
            palletsToTake = batch.palletsAvailable;
        }
        else {
            palletsToTake = Math.ceil(remaining / batchQty);
        }
        const pcsTaken = palletsToTake * batchQty;
        batches.push({
            supplier: batch.supplierName || "Unknown",
            qtyPerPallet: batchQty,
            pallets: palletsToTake,
            pcs: pcsTaken,
        });
        remaining -= pcsTaken;
        totalSPB += pcsTaken;
    }
    // Fallback if not enough physical stock
    if (remaining > 0) {
        const fallbackPallets = Math.ceil(remaining / defaultPalletQty);
        const fallbackPcs = fallbackPallets * defaultPalletQty;
        batches.push({
            supplier: "Master Data",
            qtyPerPallet: defaultPalletQty,
            pallets: fallbackPallets,
            pcs: fallbackPcs,
        });
        totalSPB += fallbackPcs;
    }
    return { batches, totalSPB };
}
// ═══════════════════════════════════════════
//  MATERIAL REQUIREMENTS CALCULATION
// ═══════════════════════════════════════════
export async function getMaterialRequirements(date) {
    const summary = await scheduleService.getShiftSummary(date);
    const stockBalance = await getStockBalanceForDate(date);
    const perSku = [];
    const grouped = {};
    for (const item of summary) {
        const bom = await masterService.getBomBySkuId(item.skuId);
        if (!bom || bom.length === 0)
            continue;
        const skuMaterials = [];
        for (const comp of bom) {
            const coeff = parseFloat(String(comp.coefficient));
            const sh1 = applyRounding(item.sh1 * coeff, comp.rounding);
            const sh2 = applyRounding(item.sh2 * coeff, comp.rounding);
            const sh3 = applyRounding(item.sh3 * coeff, comp.rounding);
            const activeShifts = (item.sh1 > 0 ? 1 : 0) + (item.sh2 > 0 ? 1 : 0) + (item.sh3 > 0 ? 1 : 0);
            const shiftDivisor = activeShifts === 0 ? 1 : activeShifts;
            const avgShiftBox = (item.sh1 + item.sh2 + item.sh3) / shiftDivisor;
            const bufferBox = (avgShiftBox / 7) * 2;
            const buffer = applyRounding(bufferBox * coeff, comp.rounding);
            const rawTotal = sh1 + sh2 + sh3 + buffer;
            skuMaterials.push({
                name: comp.materialName,
                coefficient: coeff,
                uom: comp.uom,
                rounding: comp.rounding,
                sh1, sh2, sh3, buffer, total: rawTotal,
            });
            if (!grouped[comp.materialName]) {
                grouped[comp.materialName] = { name: comp.materialName, uom: comp.uom, sh1: 0, sh2: 0, sh3: 0, buffer: 0, rawTotal: 0 };
            }
            grouped[comp.materialName].sh1 += sh1;
            grouped[comp.materialName].sh2 += sh2;
            grouped[comp.materialName].sh3 += sh3;
            grouped[comp.materialName].buffer += buffer;
            grouped[comp.materialName].rawTotal += rawTotal;
        }
        perSku.push({
            skuId: item.skuId,
            skuName: item.skuName,
            sh1: item.sh1,
            sh2: item.sh2,
            sh3: item.sh3,
            materials: skuMaterials,
        });
    }
    // Add pallet info and FIFO allocation
    const groupedArr = [];
    for (const g of Object.values(grouped)) {
        g.sisaStok = stockBalance[g.name] || 0;
        g.total = Math.max(0, g.rawTotal - g.sisaStok);
        const allocation = await allocateFromWMS(g.name, g.total);
        const palletQty = allocation.batches.length > 0 ? allocation.batches[0].qtyPerPallet : await masterService.getPalletQty(g.name);
        const palletCount = allocation.batches.reduce((sum, b) => sum + b.pallets, 0);
        groupedArr.push({
            ...g,
            batches: allocation.batches,
            palletQty,
            palletCount,
            totalSPB: allocation.totalSPB,
        });
    }
    return { perSku, grouped: groupedArr };
}
// ═══════════════════════════════════════════
//  LINE-BASED MATERIAL REQUIREMENTS
// ═══════════════════════════════════════════
export async function getLineMaterialRequirements(date) {
    const filtered = await db.schedule.findMany({ where: { date: new Date(date) } });
    const agg = {};
    for (const s of filtered) {
        const bom = await masterService.getBomBySkuId(s.skuId);
        if (!bom)
            continue;
        for (const comp of bom) {
            const coeff = parseFloat(String(comp.coefficient));
            const key = s.line + "_" + comp.materialName;
            if (!agg[key])
                agg[key] = { line: s.line, material: comp.materialName, sh1: 0, sh2: 0, sh3: 0, buffer: 0 };
            agg[key].sh1 += applyRounding(s.sh1 * coeff, comp.rounding);
            agg[key].sh2 += applyRounding(s.sh2 * coeff, comp.rounding);
            agg[key].sh3 += applyRounding(s.sh3 * coeff, comp.rounding);
            const activeShifts = (s.sh1 > 0 ? 1 : 0) + (s.sh2 > 0 ? 1 : 0) + (s.sh3 > 0 ? 1 : 0);
            const shiftDivisor = activeShifts === 0 ? 1 : activeShifts;
            const avgShiftBox = (s.sh1 + s.sh2 + s.sh3) / shiftDivisor;
            const bufferBox = (avgShiftBox / 7) * 2;
            agg[key].buffer += applyRounding(bufferBox * coeff, comp.rounding);
        }
    }
    return Object.values(agg);
}
// ═══════════════════════════════════════════
//  HOURLY DISTRIBUTION CALCULATION
// ═══════════════════════════════════════════
function isSaturday(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    return d.getDay() === 6;
}
export async function getHourlyDistribution(date) {
    const { grouped } = await getMaterialRequirements(date);
    const hourlyData = [];
    if (!grouped || grouped.length === 0)
        return hourlyData;
    const groupCount = isSaturday(date) ? 3 : 4; // Sabtu: 3 group, Senin-Jumat: 4 group
    const perShiftDist = {};
    for (const mat of grouped) {
        if (mat.totalSPB <= 0)
            continue;
        const needs = [mat.sh1, mat.sh2, mat.sh3];
        const active = needs.filter(n => n > 0).length || 1;
        const bufPS = mat.buffer / active;
        const palletQueue = [];
        mat.batches.forEach((b) => {
            for (let i = 0; i < b.pallets; i++)
                palletQueue.push({ supplier: b.supplier, qty: b.qtyPerPallet });
        });
        let sisaR = mat.sisaStok;
        const k = [0, 0, 0];
        const shiftPallets = { 0: [], 1: [], 2: [] };
        for (let s = 0; s < 3; s++) {
            const grossNeed = needs[s] + (needs[s] > 0 ? bufPS : 0);
            if (sisaR >= grossNeed) {
                k[s] = 0;
                sisaR -= grossNeed;
            }
            else {
                let req = grossNeed - sisaR;
                sisaR = 0;
                while (req > 0 && palletQueue.length > 0) {
                    const p = palletQueue.shift();
                    shiftPallets[s].push(p);
                    k[s] += p.qty;
                    req -= p.qty;
                }
                if (req < 0)
                    sisaR += Math.abs(req);
            }
        }
        perShiftDist[mat.name] = {
            kirimSH1: k[0],
            kirimSH2: k[1],
            kirimSH3: k[2],
            bufferPerShift: bufPS,
            sisaStok: mat.sisaStok,
            shiftPallets
        };
    }
    for (const mat of grouped) {
        if (mat.totalSPB <= 0)
            continue;
        const dist = perShiftDist[mat.name];
        if (!dist)
            continue;
        const bufferPcs = dist.bufferPerShift;
        const entry = {
            name: mat.name,
            kirimSH1: dist.kirimSH1,
            kirimSH2: dist.kirimSH2,
            kirimSH3: dist.kirimSH3,
            slots: { SH1: [], SH2: [], SH3: [] }
        };
        let rs = dist.sisaStok;
        const shiftKeys = ['SH1', 'SH2', 'SH3'];
        for (let s = 0; s < 3; s++) {
            const sk = shiftKeys[s];
            const needs = [mat.sh1, mat.sh2, mat.sh3];
            const sq = dist[`kirim${sk}`];
            const consumptionPerSlot = needs[s] / groupCount;
            if (sq <= 0) {
                for (let g = 0; g < groupCount; g++) {
                    entry.slots[sk].push({ pallets: 0, details: [] });
                    rs = Math.max(0, rs - consumptionPerSlot);
                }
                continue;
            }
            const sPallets = dist.shiftPallets[s]; // Array of physical pallets
            const P = sPallets.length;
            const basePalletsPerSlot = Math.floor(P / groupCount);
            let remPallets = P % groupCount;
            let pIndex = 0;
            for (let g = 0; g < groupCount; g++) {
                let count = basePalletsPerSlot + (remPallets > 0 ? 1 : 0);
                if (remPallets > 0)
                    remPallets--;
                const slotDetails = [];
                let slotPcsTotal = 0;
                while (count > 0 && pIndex < P) {
                    const p = sPallets[pIndex];
                    slotDetails.push({ supplier: p.supplier, qty: p.qty });
                    slotPcsTotal += p.qty;
                    pIndex++;
                    count--;
                }
                entry.slots[sk].push({ pallets: slotPcsTotal, details: slotDetails });
            }
        }
        hourlyData.push(entry);
    }
    return hourlyData;
}
