import { db } from "../config/database.js";
export async function getOpnameRecapPivot(filters) {
    const { startDate, endDate, area } = filters;
    // Build date filter
    const dateFilter = {};
    if (startDate)
        dateFilter.gte = new Date(startDate);
    if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.lte = end;
    }
    const hasDates = Object.keys(dateFilter).length > 0;
    // 1. Load kamus opname for oracle codes & UOM
    const kamusAll = await db.kamusOpname.findMany();
    const kamusMap = {};
    kamusAll.forEach(k => {
        kamusMap[k.materialName] = { oracleCode: k.oracleCode || null };
    });
    // 2. Load BOM components for UOM info
    const bomComponents = await db.bomComponent.findMany({ select: { materialName: true, uom: true, line: true } });
    const uomMap = {};
    bomComponents.forEach(b => { if (b.materialName && b.uom)
        uomMap[b.materialName] = b.uom; });
    const shouldFetchLine = !area || area === 'ALL' || area !== 'TRANSIT';
    const shouldFetchTransit = !area || area === 'ALL' || area === 'TRANSIT';
    // pivot structure: materialName -> { oracleCode, uom, lines, transit }
    const pivot = {};
    const allLineNames = new Set();
    // Track which materials were opname'd in the selected period
    const opnamedMaterials = new Set();
    const getOrCreateMaterial = (matName) => {
        if (!pivot[matName]) {
            pivot[matName] = {
                oracleCode: kamusMap[matName]?.oracleCode || null,
                uom: uomMap[matName] || 'pcs',
                lines: {},
                transit: { qtyBook: 0, qtyPhysical: 0 },
            };
        }
        return pivot[matName];
    };
    // 3. Production opnames within selected period
    if (shouldFetchLine) {
        const lineWhere = {};
        if (hasDates)
            lineWhere.date = dateFilter;
        if (area && area !== 'ALL' && area !== 'TRANSIT' && area !== 'ALL_LINES')
            lineWhere.line = area;
        const prodOpnames = await db.productionOpname.findMany({
            where: lineWhere,
            include: { items: true },
            orderBy: { date: 'asc' },
        });
        for (const op of prodOpnames) {
            const lineName = op.line;
            allLineNames.add(lineName);
            for (const item of op.items) {
                const mat = getOrCreateMaterial(item.materialName);
                if (!mat.lines[lineName])
                    mat.lines[lineName] = { qtyBook: 0, qtyPhysical: 0 };
                mat.lines[lineName].qtyBook = Number(item.qtyBook);
                mat.lines[lineName].qtyPhysical = Number(item.qtyPhysical);
                opnamedMaterials.add(item.materialName);
            }
        }
        // Also collect all unique line names from all-time records (so we know all lines)
        const allProdLines = await db.productionOpname.findMany({ select: { line: true }, distinct: ['line'] });
        allProdLines.forEach(p => allLineNames.add(p.line));
    }
    // 4. Transit opnames within selected period
    if (shouldFetchTransit) {
        const transitWhere = {};
        if (hasDates)
            transitWhere.date = dateFilter;
        const transitOpnames = await db.transitOpname.findMany({
            where: transitWhere,
            include: { items: { include: { blockRow: { include: { blockLayout: true } } } } },
            orderBy: { date: 'asc' },
        });
        for (const op of transitOpnames) {
            for (const item of op.items) {
                const mat = getOrCreateMaterial(item.materialName);
                mat.transit.qtyBook += Number(item.qtyBook);
                mat.transit.qtyPhysical += Number(item.qtyPhysical);
                opnamedMaterials.add(item.materialName);
            }
        }
    }
    const sortedLines = [...allLineNames].sort();
    // 5. Build pivot rows for opname'd materials
    const rows = Object.entries(pivot).map(([materialName, data]) => {
        let totalBook = data.transit.qtyBook;
        let totalPhysical = data.transit.qtyPhysical;
        const lineValues = {};
        for (const lineName of sortedLines) {
            const ld = data.lines[lineName] || { qtyBook: 0, qtyPhysical: 0 };
            lineValues[lineName] = ld;
            totalBook += ld.qtyBook;
            totalPhysical += ld.qtyPhysical;
        }
        return {
            materialName,
            oracleCode: data.oracleCode,
            uom: data.uom,
            lineValues,
            transit: data.transit,
            totalBook,
            totalPhysical,
            selisih: totalPhysical - totalBook,
        };
    });
    rows.sort((a, b) => a.materialName.localeCompare(b.materialName));
    // ─────────────────────────────────────────────────────────────────
    // 6. Detect materials NOT YET opname'd in the selected period
    //    Reference: all-time opname history to find known "book" qty
    // ─────────────────────────────────────────────────────────────────
    // Gather all known materials from all-time opname history
    const allProdItems = await db.productionOpnameItem.findMany({
        select: { materialName: true, qtyBook: true },
        orderBy: { id: 'asc' },
    });
    const allTransitItems = await db.transitOpnameItem.findMany({
        select: { materialName: true, qtyBook: true },
    });
    // Latest known book qty per material (from all-time history)
    const latestBookQty = {};
    for (const item of allProdItems) {
        latestBookQty[item.materialName] = Number(item.qtyBook); // last one wins (sorted asc)
    }
    for (const item of allTransitItems) {
        if (!(item.materialName in latestBookQty)) {
            latestBookQty[item.materialName] = Number(item.qtyBook);
        }
        else {
            latestBookQty[item.materialName] = Math.max(latestBookQty[item.materialName], Number(item.qtyBook));
        }
    }
    // Also add all KamusOpname materials even if never opname'd
    kamusAll.forEach(k => {
        if (!(k.materialName in latestBookQty)) {
            latestBookQty[k.materialName] = 0;
        }
    });
    // Find materials NOT in opnamedMaterials but present in all-time history or kamus
    const notOpnamed = [];
    for (const [matName, bookQty] of Object.entries(latestBookQty)) {
        if (!opnamedMaterials.has(matName) && bookQty > 0) {
            notOpnamed.push({
                materialName: matName,
                oracleCode: kamusMap[matName]?.oracleCode || null,
                uom: uomMap[matName] || 'pcs',
                lastKnownBook: bookQty,
            });
        }
    }
    notOpnamed.sort((a, b) => a.materialName.localeCompare(b.materialName));
    return {
        lines: sortedLines,
        rows,
        notOpnamed,
    };
}
