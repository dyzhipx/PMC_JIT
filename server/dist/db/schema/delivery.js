import { pgTable, uuid, varchar, integer, decimal, date, timestamp } from "drizzle-orm/pg-core";
// ═══════════════════════════════════════════
//  DELIVERIES (warehouse → transit requests)
// ═══════════════════════════════════════════
export const deliveries = pgTable("deliveries", {
    id: uuid("id").defaultRandom().primaryKey(),
    compositeKey: varchar("composite_key", { length: 100 }).notNull().unique(), // 'YYYY-MM-DD_SH1_1'
    date: date("date").notNull(),
    shiftKey: varchar("shift_key", { length: 10 }).notNull(),
    slotId: integer("slot_id").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("preparing"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
// ═══════════════════════════════════════════
//  DELIVERY ITEMS
// ═══════════════════════════════════════════
export const deliveryItems = pgTable("delivery_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    deliveryId: uuid("delivery_id").notNull().references(() => deliveries.id, { onDelete: "cascade" }),
    materialName: varchar("material_name", { length: 255 }).notNull(),
    requiredPallets: integer("required_pallets").notNull().default(0),
    scannedPallets: decimal("scanned_pallets", { precision: 10, scale: 4 }).default("0"),
});
// ═══════════════════════════════════════════
//  DELIVERY SCANS (individual barcode scans)
// ═══════════════════════════════════════════
export const deliveryScans = pgTable("delivery_scans", {
    id: uuid("id").defaultRandom().primaryKey(),
    deliveryId: uuid("delivery_id").notNull().references(() => deliveries.id, { onDelete: "cascade" }),
    deliveryItemId: uuid("delivery_item_id").notNull().references(() => deliveryItems.id, { onDelete: "cascade" }),
    barcode: varchar("barcode", { length: 50 }).unique(),
    qtyPallet: integer("qty_pallet").notNull().default(1),
    uom: varchar("uom", { length: 20 }),
    pcs: decimal("pcs", { precision: 12, scale: 4 }),
    supplier: varchar("supplier", { length: 255 }),
    scannedAt: timestamp("scanned_at").defaultNow(),
});
