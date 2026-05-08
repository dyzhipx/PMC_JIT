import { pgTable, uuid, varchar, integer, decimal, date, time, timestamp } from "drizzle-orm/pg-core";
import { suppliers } from "./master.js";
// ═══════════════════════════════════════════
//  WAREHOUSE (WMS) INVENTORY
// ═══════════════════════════════════════════
export const warehouseInventory = pgTable("warehouse_inventory", {
    id: uuid("id").defaultRandom().primaryKey(),
    mid: varchar("mid", { length: 50 }).notNull(),
    barcode: varchar("barcode", { length: 50 }).notNull().unique(),
    materialName: varchar("material_name", { length: 255 }).notNull(),
    supplierName: varchar("supplier_name", { length: 255 }),
    supplierId: uuid("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
    qtyPerPallet: decimal("qty_per_pallet", { precision: 10, scale: 2 }),
    palletsAvailable: integer("pallets_available").notNull().default(1),
    dateIn: date("date_in").notNull(),
    timeIn: time("time_in").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});
// ═══════════════════════════════════════════
//  SYSTEM COUNTERS (barcode, MID auto-increment)
// ═══════════════════════════════════════════
export const systemCounters = pgTable("system_counters", {
    id: varchar("id", { length: 50 }).primaryKey(),
    value: integer("value").notNull().default(0),
});
