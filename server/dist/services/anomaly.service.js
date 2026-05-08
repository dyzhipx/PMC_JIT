import { db as prisma } from "../config/database.js";
export async function getUnscannedTransit(anomalyThresholdHours = 3) {
    const now = new Date();
    const thresholdTime = new Date(now.getTime() - anomalyThresholdHours * 60 * 60 * 1000);
    // Find all items in Transit
    const transitItems = await prisma.transitInventory.findMany({
        select: {
            barcode: true,
            materialName: true,
            supplier: true,
            dateInTransit: true,
            timeInTransit: true
        }
    });
    const anomalies = [];
    // Group BPP items by material for today to minimize DB queries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bppItems = await prisma.productionBppItem.groupBy({
        by: ['materialName'],
        _sum: {
            qtyDeducted: true
        },
        where: {
            bpp: {
                date: {
                    gte: today
                }
            }
        }
    });
    const bppMap = new Map();
    bppItems.forEach((item) => {
        bppMap.set(item.materialName, Number(item._sum.qtyDeducted || 0));
    });
    for (const item of transitItems) {
        // Combine dateInTransit and timeInTransit
        // Note: Prisma returns Date objects. We need to construct the actual Date
        const itemDate = new Date(item.dateInTransit);
        const itemTime = new Date(item.timeInTransit);
        itemDate.setUTCHours(itemTime.getUTCHours(), itemTime.getUTCMinutes(), itemTime.getUTCSeconds());
        const waitingHours = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60);
        if (waitingHours >= anomalyThresholdHours) {
            const bppQty = bppMap.get(item.materialName) || 0;
            const statusStr = bppQty > 0 ? "Lupa Scan" : "Idle/Trouble";
            // Calculate Shift purely by checking hour of dateInTransit 
            // (Assuming 07-15 is Shift 1, 15-23 Shift 2, 23-07 Shift 3)
            const hours = itemDate.getHours();
            let shiftVal = 3;
            if (hours >= 7 && hours < 15)
                shiftVal = 1;
            else if (hours >= 15 && hours < 23)
                shiftVal = 2;
            // Upsert into AnomalyLog
            try {
                await prisma.anomalyLog.upsert({
                    where: {
                        barcode_status: {
                            barcode: item.barcode,
                            status: statusStr
                        }
                    },
                    update: {
                        bppQty: bppQty
                    },
                    create: {
                        barcode: item.barcode,
                        materialName: item.materialName,
                        dateInTransit: item.dateInTransit,
                        timeInTransit: item.timeInTransit,
                        status: statusStr,
                        shift: shiftVal,
                        bppQty: bppQty
                    }
                });
            }
            catch (e) {
                console.warn('Failed to upsert anomaly log:', e);
            }
            anomalies.push({
                barcode: item.barcode,
                materialName: item.materialName,
                supplier: item.supplier,
                timeInTransit: itemDate,
                shift: shiftVal,
                waitingHours: parseFloat(waitingHours.toFixed(1)),
                status: statusStr,
                bppQtyDeducted: bppQty
            });
        }
    }
    // Resolve anomalies that are no longer in Transit
    try {
        const currentAnomalyBarcodes = anomalies.map(a => a.barcode);
        await prisma.anomalyLog.updateMany({
            where: {
                barcode: { notIn: currentAnomalyBarcodes },
                resolvedAt: null
            },
            data: {
                resolvedAt: new Date()
            }
        });
    }
    catch (e) {
        console.warn('Failed to resolve anomalies:', e);
    }
    // Sort by waiting hours descending
    anomalies.sort((a, b) => b.waitingHours - a.waitingHours);
    return anomalies;
}
