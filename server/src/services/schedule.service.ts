import { db } from "../config/database.js";
import * as masterService from "./master.service.js";

// ═══════════════════════════════════════════
//  SCHEDULE CRUD
// ═══════════════════════════════════════════
export async function getAllSchedules(filters?: { date?: string; line?: string; status?: string }) {
  const where: any = {};
  if (filters?.date) where.date = new Date(filters.date);
  if (filters?.line) where.line = filters.line;
  if (filters?.status) where.status = filters.status;

  return db.schedule.findMany({
    where,
    orderBy: [
      { date: 'asc' },
      { line: 'asc' }
    ]
  });
}

export async function getUniqueDates(): Promise<string[]> {
  const rows = await db.schedule.findMany({
    select: { date: true },
    distinct: ['date'],
    orderBy: { date: 'asc' }
  });
  return rows.map((r: any) => r.date.toISOString().split("T")[0]);
}

export async function importSchedules(items: Array<{
  date: string;
  line: string;
  skuId: string;
  sh1: number;
  sh2: number;
  sh3: number;
  status?: string;
}>) {
  if (items.length === 0) return [];
  
  const created = [];
  for (const item of items) {
     const c = await db.schedule.create({
       data: {
         ...item,
         date: new Date(item.date),
         status: item.status || "pending",
       }
     });
     created.push(c);
  }
  return created;
}

export async function updateSchedule(id: string, data: Partial<{ sh1: number; sh2: number; sh3: number; status: string }>) {
  return db.schedule.update({
    where: { id },
    data
  });
}

export async function deleteSchedule(id: string) {
  await db.schedule.delete({ where: { id } });
}

export async function markDateConverted(date: string) {
  await db.schedule.updateMany({
    where: { date: new Date(date) },
    data: { status: "converted" }
  });
}

// ═══════════════════════════════════════════
//  SHIFT SUMMARY
// ═══════════════════════════════════════════
export async function getShiftSummary(date: string) {
  const filtered = await db.schedule.findMany({
    where: { date: new Date(date) }
  });

  const agg: Record<string, { skuId: string; sh1: number; sh2: number; sh3: number }> = {};

  for (const s of filtered) {
    if (!agg[s.skuId]) agg[s.skuId] = { skuId: s.skuId, sh1: 0, sh2: 0, sh3: 0 };
    agg[s.skuId].sh1 += s.sh1;
    agg[s.skuId].sh2 += s.sh2;
    agg[s.skuId].sh3 += s.sh3;
  }

  const result = [];
  for (const a of Object.values(agg)) {
    const sku = await masterService.getSkuById(a.skuId);
    result.push({
      ...a,
      total: a.sh1 + a.sh2 + a.sh3,
      skuName: sku?.name || a.skuId,
    });
  }
  return result;
}
