import { pgTable, uuid, varchar, integer, decimal, date, timestamp, text } from "drizzle-orm/pg-core";
import { skus } from "./master.js";
// ═══════════════════════════════════════════
//  BLOCK LAYOUT
// ═══════════════════════════════════════════
export const blockLayout = pgTable("block_layout", {
    id: uuid("id").defaultRandom().primaryKey(),
    blockNumber: integer("block_number").notNull().unique(),
    skuId: uuid("sku_id").references(() => skus.id, { onDelete: "set null" }),
    sortOrder: integer("sort_order").default(0),
});
// ═══════════════════════════════════════════
//  BLOCK ROWS
// ═══════════════════════════════════════════
export const blockRows = pgTable("block_rows", {
    id: uuid("id").defaultRandom().primaryKey(),
    blockId: uuid("block_id").notNull().references(() => blockLayout.id, { onDelete: "cascade" }),
    rowNumber: integer("row_number").notNull(),
    materialName: varchar("material_name", { length: 255 }).default(""),
    maxPallets: integer("max_pallets").notNull().default(4),
    assignedLines: text("assigned_lines").array(), // ['A', 'B']
});
// ═══════════════════════════════════════════
//  STOCK CHECKS (daily physical count)
// ═══════════════════════════════════════════
export const stockChecks = pgTable("stock_checks", {
    id: uuid("id").defaultRandom().primaryKey(),
    checkDate: date("check_date").notNull().unique(),
    checkedBy: varchar("checked_by", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow(),
});
export const stockCheckEntries = pgTable("stock_check_entries", {
    id: uuid("id").defaultRandom().primaryKey(),
    stockCheckId: uuid("stock_check_id").notNull().references(() => stockChecks.id, { onDelete: "cascade" }),
    blockRowId: uuid("block_row_id").notNull().references(() => blockRows.id, { onDelete: "cascade" }),
    palletIndex: integer("pallet_index").notNull(),
    quantity: decimal("quantity", { precision: 10, scale: 4 }),
});
