import { db } from "../config/database.js";
import { getMaterialUOM } from "./master.service.js";

// Helper function to extract YYYY-MM-DD from various date formats
function getDateStr(dateObj: any): string {
  if (!dateObj) return "";
  if (typeof dateObj === "string") return dateObj.substring(0, 10);
  try {
     return dateObj.toISOString().substring(0, 10);
  } catch (e) {
     return String(dateObj).substring(0, 10);
  }
}

export async function getProductionMutationReport(filters: { material?: string; line?: string; startDate?: string; endDate?: string } = {}) {
  const where: any = {};
  if (filters.material && filters.material !== "ALL") where.materialName = filters.material;
  if (filters.line && filters.line !== "ALL") where.line = { contains: filters.line };
  
  // We fetch ALL dates because we need to calculate initial stock (Saldo Awal) from history
  where.OR = [
    { source: "PRODUCTION" },
    { source: "PROD_BPP" },
    { source: "LINE_OPNAME" },
    { source: "RETURN_FULL" },
    { source: "RETURN_PARTIAL" },
    { source: "LINE_REJECT" },
    { source: { contains: "LINE" } }
  ];

  const mutations = await db.stockMutation.findMany({ where });

  // Gather materials
  const matSet = new Set<string>();
  mutations.forEach((m: any) => matSet.add(m.materialName));

  // Also include materials from lineStock to ensure we show everything that has stock
  const lineStocks = await db.lineStock.findMany({
    where: (filters.line && filters.line !== "ALL") ? { line: filters.line } : undefined,
    select: { materialName: true, pcs: true, line: true }
  });
  lineStocks.forEach((ls: any) => matSet.add(ls.materialName));

  const reportList: any[] = [];
  const _today = new Date().toISOString().split("T")[0];
  const reportStartDate = filters.startDate || null;
  const reportEndDate = filters.endDate || null;
  const shouldCompareActual = !reportEndDate || reportEndDate >= _today;

  for (const matName of Array.from(matSet)) {
    if (filters.material && filters.material !== 'ALL' && matName !== filters.material) continue;

    let initialStock = 0;
    let totalIn = 0;
    let totalConsume = 0;
    let totalReturn = 0;
    let totalReject = 0;
    let totalAdjust = 0;

    const matMutations = mutations.filter((m: any) => {
      if (m.materialName !== matName) return false;
      if (filters.line && filters.line !== 'ALL') {
        if (!m.line?.includes(filters.line)) return false;
      }
      return true;
    });

    matMutations.forEach((m: any) => {
      const q = parseFloat(String(m.qty)) || 0;
      const mutDate = getDateStr(m.date);
      const isBeforeStart = reportStartDate && mutDate < reportStartDate;
      const isAfterEnd = reportEndDate && mutDate > reportEndDate;
      if (isAfterEnd) return;

      if (isBeforeStart) {
        if (m.source === 'PRODUCTION') initialStock += Math.abs(q);
        else if (m.source === 'PROD_BPP' || m.type === 'CONSUME') initialStock -= Math.abs(q);
        else if (m.source === 'RETURN_FULL' || m.source === 'RETURN_PARTIAL') initialStock -= Math.abs(q);
        else if (m.source === 'LINE_REJECT') initialStock -= Math.abs(q);
        else if (m.source === 'LINE_OPNAME' || m.type === 'ADJUST') initialStock += q;
      } else {
        if (m.source === 'PRODUCTION') totalIn += Math.abs(q);
        else if (m.source === 'PROD_BPP' || m.type === 'CONSUME') totalConsume += Math.abs(q);
        else if (m.source === 'RETURN_FULL' || m.source === 'RETURN_PARTIAL') totalReturn += Math.abs(q);
        else if (m.source === 'LINE_REJECT') totalReject += Math.abs(q);
        else if (m.source === 'LINE_OPNAME' || m.type === 'ADJUST') totalAdjust += q;
      }
    });

    const finalStock = initialStock + totalIn - totalConsume - totalReturn - totalReject + totalAdjust;

    let actualStock: number | null = null;
    if (shouldCompareActual) {
      actualStock = 0;
      lineStocks.filter((ls: any) => ls.materialName === matName).forEach((ls: any) => {
        actualStock! += parseFloat(String(ls.pcs || "0"));
      });
    }

    const selisih = actualStock !== null ? Math.round((finalStock - actualStock) * 10000) / 10000 : null;

    if (initialStock > 0 || totalIn > 0 || totalConsume > 0 || totalReturn > 0 || totalReject > 0 || totalAdjust !== 0 || Math.abs(finalStock) > 0.001) {
      reportList.push({
        material: matName,
        uom: await getMaterialUOM(matName),
        initial: initialStock,
        inbound: totalIn,
        consume: totalConsume,
        returnOut: totalReturn,
        reject: totalReject,
        adjust: totalAdjust,
        final: finalStock,
        actualStock,
        selisih
      });
    }
  }

  reportList.sort((a, b) => (a.material || "").localeCompare(b.material || ""));
  return { reportList };
}

export async function getTransitMutationReport(filters: { material?: string; block?: string; row?: string; line?: string; sku?: string; startDate?: string; endDate?: string } = {}) {
  const where: any = {};
  if (filters.material && filters.material !== "ALL") where.materialName = filters.material;
  if (filters.block && filters.block !== "ALL") where.blockId = filters.block;
  if (filters.row && filters.row !== "ALL") where.blockRowId = filters.row;
  if (filters.line && filters.line !== "ALL") where.line = filters.line;
  if (filters.sku && filters.sku !== "ALL") where.skuId = filters.sku;

  // Exclude line-specific mutations from transit mutation report
  where.source = { notIn: ['PROD_BPP', 'LINE_REJECT', 'LINE_OPNAME'] };

  const mutations = await db.stockMutation.findMany({ where });

  const matSet = new Set<string>();
  mutations.forEach((m: any) => matSet.add(m.materialName!));

  const _today = new Date().toISOString().split('T')[0];
  const reportStartDate = filters.startDate || null;
  const reportEndDate = filters.endDate || null;
  const shouldCompareActual = !reportEndDate || reportEndDate >= _today;

  let transitInventories: any[] = [];
  if (shouldCompareActual) {
    const tiWhere: any = {};
    if (filters.material && filters.material !== "ALL") tiWhere.materialName = filters.material;
    if (filters.block && filters.block !== "ALL") tiWhere.blockId = filters.block;
    if (filters.row && filters.row !== "ALL") tiWhere.blockRowId = filters.row;
    transitInventories = await db.transitInventory.findMany({ where: tiWhere });
  }

  // Removed manual UOM mapping

  const reportList: any[] = [];
  const summary = {
    totalWarehouseIn: 0,
    totalReturnIn: 0,
    totalRelocIn: 0,
    totalRelocOut: 0,
    totalProductionOut: 0
  };

  for (const matName of Array.from(matSet)) {
    let initialStock = 0;
    let totalInWarehouse = 0, totalInReturn = 0, totalInReloc = 0;
    let totalOut = 0, totalOutReloc = 0, totalAdjust = 0;

    const materialMutations = mutations.filter((m: any) => m.materialName === matName);

    materialMutations.forEach((m: any) => {
      const q = parseFloat(String(m.qty)) || 0;
      const mutDate = getDateStr(m.date);
      const isBeforeStart = reportStartDate && mutDate < reportStartDate;
      const isAfterEnd = reportEndDate && mutDate > reportEndDate;
      const isStockCheckBaseline = m.line === 'Stock Check Adjustment' || m.line === 'Koreksi Saldo Awal';

      if (isAfterEnd) return;

      if (isBeforeStart || isStockCheckBaseline) {
         if (m.type === 'IN' || m.type === 'ADJUST') initialStock += q;
         else if (m.type === 'OUT') initialStock -= Math.abs(q);
      } else {
         if (m.type === 'IN') {
            if (m.source === 'WAREHOUSE') {
               totalInWarehouse += q;
               summary.totalWarehouseIn += q;
            } else if (m.source === 'RETURN_FULL' || m.source === 'RETURN_PARTIAL') {
               totalInReturn += q;
               summary.totalReturnIn += q;
            } else if (m.source === 'RELOKASI') {
               totalInReloc += q;
               summary.totalRelocIn += q;
            } else {
               totalInWarehouse += q;
               summary.totalWarehouseIn += q;
            }
          } else if (m.type === 'OUT') {
             if (m.source === 'RELOKASI') {
                totalOutReloc += Math.abs(q);
                summary.totalRelocOut += Math.abs(q);
             } else {
                totalOut += Math.abs(q);
                if (m.source === 'PRODUCTION') summary.totalProductionOut += Math.abs(q);
             }
          } else if (m.type === 'ADJUST') {
             totalAdjust += q;
          }
      }
    });

    const totalIn = totalInWarehouse + totalInReturn;
    const netReloc = totalInReloc - totalOutReloc;
    const finalStock = initialStock + totalIn - totalOut + netReloc + totalAdjust;

    let actualStock: number | null = null;
    if (shouldCompareActual && (!filters.sku || filters.sku === 'ALL') && (!filters.line || filters.line === 'ALL')) {
      actualStock = 0;
      transitInventories.filter((ti: any) => ti.materialName === matName).forEach((ti: any) => {
         const defPQ = 1; // getPalletQty would be complex to fetch here for all, we fallback to just reading pcs
         const pcsVal = ti.pcs ? parseFloat(String(ti.pcs)) : (ti.palletsAvailable * defPQ);
         actualStock! += pcsVal;
      });
    }

    const selisih = actualStock !== null ? Math.round((finalStock - actualStock) * 10000) / 10000 : null;

    if (initialStock > 0 || totalInWarehouse > 0 || totalInReturn > 0 || totalInReloc > 0 || totalOut > 0 || totalOutReloc > 0 || totalAdjust !== 0 || Math.abs(finalStock) > 0.001) {
      reportList.push({
        material: matName,
        uom: await getMaterialUOM(matName),
        initial: initialStock,
        inboundWarehouse: totalInWarehouse,
        inboundReturn: totalInReturn,
        inboundReloc: totalInReloc,
        outbound: totalOut,
        outboundReloc: totalOutReloc,
        adjust: totalAdjust,
        final: finalStock,
        actualStock,
        selisih
      });
    }
  }

  reportList.sort((a, b) => (a.material || "").localeCompare(b.material || ""));
  return { reportList, summary };
}
