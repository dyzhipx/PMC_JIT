import { pgTable, uuid, varchar, integer, decimal, date, time, timestamp } from "drizzle-orm/pg-core";
import { blockLayout, blockRows } from "./block.js";
// ═══════════════════════════════════════════
//  TRANSIT INVENTORY (individual barcode tracking)
// ═══════════════════════════════════════════
export const transitInventory = pgTable("transit_inventory", {
    id: uuid("id").defaultRandom().primaryKey(),
    materialName: varchar("material_name", { length: 255 }).notNull(),
    barcode: varchar("barcode", { length: 50 }).notNull(),
    mid: varchar("mid", { length: 50 }),
    dateInGudang: date("date_in_gudang"),
    dateInTransit: date("date_in_transit").notNull(),
    timeInTransit: time("time_in_transit").notNull(),
    palletsAvailable: integer("pallets_available").notNull().default(1),
    supplier: varchar("supplier", { length: 255 }),
    blockId: uuid("block_id").references(() => blockLayout.id, { onDelete: "set null" }),
    blockRowId: uuid("block_row_id").references(() => blockRows.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow(),
});
// ═══════════════════════════════════════════
//  TRANSIT STOCK LIVE (aggregate per block/row)
// ═══════════════════════════════════════════
export const transitStockLive = pgTable("transit_stock_live", {
    id: uuid("id").defaultRandom().primaryKey(),
    blockRowId: uuid("block_row_id").notNull().references(() => blockRows.id, { onDelete: "cascade" }),
    materialName: varchar("material_name", { length: 255 }),
    qtyPallets: integer("qty_pallets").notNull().default(0),
    pcs: decimal("pcs", { precision: 12, scale: 4 }).default("0"),
});
// ═══════════════════════════════════════════
//  STOCK MUTATIONS (audit log)
// ═══════════════════════════════════════════
export const stockMutations = pgTable("stock_mutations", {
    id: uuid("id").defaultRandom().primaryKey(),
    date: date("date").notNull(),
    time: time("time").notNull(),
    type: varchar("type", { length: 10 }).notNull(), // 'IN' | 'OUT'
    materialName: varchar("material_name", { length: 255 }).notNull(),
    qty: decimal("qty", { precision: 12, scale: 4 }).notNull(),
    uom: varchar("uom", { length: 20 }).notNull(),
    line: varchar("line", { length: 100 }),
    skuId: varchar("sku_id", { length: 50 }),
    barcode: varchar("barcode", { length: 50 }),
    blockId: uuid("block_id").references(() => blockLayout.id, { onDelete: "set null" }),
    blockRowId: uuid("block_row_id").references(() => blockRows.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow(),
});
// ═══════════════════════════════════════════
//  USED BARCODES (prevent duplicate transit receive)
// ═══════════════════════════════════════════
export const usedBarcodes = pgTable("used_barcodes", {
    id: uuid("id").defaultRandom().primaryKey(),
    barcode: varchar("barcode", { length: 50 }).notNull().unique(),
    usedAt: timestamp("used_at").defaultNow(),
});
// ═══════════════════════════════════════════
//  TRANSIT OUTBOUND PENDING
// ═══════════════════════════════════════════
export const transitOutboundPending = pgTable("transit_outbound_pending", {
    id: uuid("id").defaultRandom().primaryKey(),
    barcode: varchar("barcode", { length: 50 }).notNull(),
    materialName: varchar("material_name", { length: 255 }).notNull(),
    supplier: varchar("supplier", { length: 255 }),
    pcs: decimal("pcs", { precision: 12, scale: 4 }),
    destination: varchar("destination", { length: 20 }).notNull(), // '3P1','3F1','3F2','3P2'
    targetLine: varchar("target_line", { length: 10 }),
    date: date("date").notNull(),
    time: time("time").notNull(),
    blockId: uuid("block_id").references(() => blockLayout.id, { onDelete: "set null" }),
    blockRowId: uuid("block_row_id").references(() => blockRows.id, { onDelete: "set null" }),
    status: varchar("status", { length: 20 }).default("pending"),
    createdAt: timestamp("created_at").defaultNow(),
});
