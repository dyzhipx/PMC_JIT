import { pgTable, uuid, varchar, integer, decimal, date, time, timestamp, unique } from "drizzle-orm/pg-core";
// ═══════════════════════════════════════════
//  LINE STOCK (aggregate per line + material)
// ═══════════════════════════════════════════
export const lineStock = pgTable("line_stock", {
    id: uuid("id").defaultRandom().primaryKey(),
    line: varchar("line", { length: 10 }).notNull(),
    materialName: varchar("material_name", { length: 255 }).notNull(),
    qtyPallets: integer("qty_pallets").notNull().default(0),
    pcs: decimal("pcs", { precision: 12, scale: 4 }).default("0"),
}, (table) => [
    unique("uq_line_material").on(table.line, table.materialName),
]);
// ═══════════════════════════════════════════
//  LINE BARCODES (individual barcode tracking)
// ═══════════════════════════════════════════
export const lineBarcodes = pgTable("line_barcodes", {
    id: uuid("id").defaultRandom().primaryKey(),
    barcode: varchar("barcode", { length: 50 }).notNull(),
    materialName: varchar("material_name", { length: 255 }).notNull(),
    line: varchar("line", { length: 10 }).notNull(),
    pcs: decimal("pcs", { precision: 12, scale: 4 }),
    supplier: varchar("supplier", { length: 255 }),
    dateIn: date("date_in").notNull(),
    timeIn: time("time_in").notNull(),
});
// ═══════════════════════════════════════════
//  PENDING RETURNS (line → transit)
// ═══════════════════════════════════════════
export const pendingReturns = pgTable("pending_returns", {
    id: uuid("id").defaultRandom().primaryKey(),
    barcode: varchar("barcode", { length: 50 }).notNull(),
    materialName: varchar("material_name", { length: 255 }).notNull(),
    line: varchar("line", { length: 10 }).notNull(),
    pcs: decimal("pcs", { precision: 12, scale: 4 }),
    supplier: varchar("supplier", { length: 255 }),
    date: date("date").notNull(),
    time: time("time").notNull(),
    status: varchar("status", { length: 20 }).default("pending"),
    createdAt: timestamp("created_at").defaultNow(),
});
