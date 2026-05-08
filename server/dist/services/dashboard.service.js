import { db } from "../config/database.js";
export async function getStats() {
    const skuCount = await db.sku.count();
    const bomCount = await db.bomComponent.count();
    const allSchedules = await db.schedule.findMany();
    const totalBox = allSchedules.reduce((sum, s) => sum + s.sh1 + s.sh2 + s.sh3, 0);
    const pendingDates = new Set(allSchedules.filter((s) => s.status === "pending").map((s) => s.date.toISOString().split("T")[0]));
    const allDates = [...new Set(allSchedules.map((s) => s.date.toISOString().split("T")[0]))].sort();
    return {
        totalSKU: skuCount,
        totalBOM: bomCount,
        totalBox,
        pending: pendingDates.size,
        dates: allDates,
    };
}
export async function getDailyProduction() {
    // Limit to last 14 days
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const allSchedules = await db.schedule.findMany({
        where: {
            date: {
                gte: fourteenDaysAgo,
            },
        },
    });
    const byDate = {};
    for (const s of allSchedules) {
        const dStr = s.date.toISOString().split("T")[0];
        if (!byDate[dStr])
            byDate[dStr] = { sh1: 0, sh2: 0, sh3: 0 };
        byDate[dStr].sh1 += s.sh1;
        byDate[dStr].sh2 += s.sh2;
        byDate[dStr].sh3 += s.sh3;
    }
    return Object.entries(byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, d]) => ({ date, sh1: d.sh1, sh2: d.sh2, sh3: d.sh3, total: d.sh1 + d.sh2 + d.sh3 }));
}
export async function getRecentSchedules() {
    const allSchedules = await db.schedule.findMany();
    const byDate = {};
    for (const s of allSchedules) {
        const dStr = s.date.toISOString().split("T")[0];
        if (!byDate[dStr])
            byDate[dStr] = { date: dStr, skus: new Set(), total: 0, status: s.status };
        byDate[dStr].skus.add(s.skuId);
        byDate[dStr].total += s.sh1 + s.sh2 + s.sh3;
        if (s.status === "pending")
            byDate[dStr].status = "pending";
    }
    return Object.values(byDate)
        .map((d) => ({ date: d.date, skuCount: d.skus.size, total: d.total, status: d.status }))
        .sort((a, b) => b.date.localeCompare(a.date));
}
