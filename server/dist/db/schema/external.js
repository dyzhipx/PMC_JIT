import { pgTable, uuid, varchar, integer, decimal, date, time, unique } from "drizzle-orm/pg-core";
// ═══════════════════════════════════════════
//  EXTERNAL ON-HAND (3P2, 3F2 destinations)
// ═══════════════════════════════════════════
export const externalOnhand = pgTable("external_onhand", {
    id: uuid("id").defaultRandom().primaryKey(),
    destination: varchar("destination", { length: 10 }).notNull(), // '3P2' or '3F2'
    materialName: varchar("material_name", { length: 255 }).notNull(),
    qtyPallets: integer("qty_pallets").notNull().default(0),
    pcs: decimal("pcs", { precision: 12, scale: 4 }).default("0"),
}, (table) => [
    unique("uq_dest_material").on(table.destination, table.materialName),
]);
export const externalOnhandBarcodes = pgTable("external_onhand_barcodes", {
    id: uuid("id").defaultRandom().primaryKey(),
    destination: varchar("destination", { length: 10 }).notNull(),
    barcode: varchar("barcode", { length: 50 }).notNull(),
    materialName: varchar("material_name", { length: 255 }).notNull(),
    pcs: decimal("pcs", { precision: 12, scale: 4 }),
    supplier: varchar("supplier", { length: 255 }),
    dateIn: date("date_in").notNull(),
    timeIn: time("time_in").notNull(),
});
