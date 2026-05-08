import { pgTable, uuid, varchar, text, timestamp, decimal, integer, unique } from "drizzle-orm/pg-core";
// ═══════════════════════════════════════════
//  MASTER DATA: Suppliers
// ═══════════════════════════════════════════
export const suppliers = pgTable("suppliers", {
    id: uuid("id").defaultRandom().primaryKey(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    contact: varchar("contact", { length: 100 }),
    address: text("address"),
    createdAt: timestamp("created_at").defaultNow(),
});
// ═══════════════════════════════════════════
//  MASTER DATA: SKUs
// ═══════════════════════════════════════════
export const skus = pgTable("skus", {
    id: uuid("id").defaultRandom().primaryKey(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    uom: varchar("uom", { length: 20 }).notNull().default("BOX"),
    supplierId: uuid("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
// ═══════════════════════════════════════════
//  MASTER DATA: BOM Components
// ═══════════════════════════════════════════
export const bomComponents = pgTable("bom_components", {
    id: uuid("id").defaultRandom().primaryKey(),
    skuId: uuid("sku_id").notNull().references(() => skus.id, { onDelete: "cascade" }),
    line: varchar("line", { length: 10 }),
    materialName: varchar("material_name", { length: 255 }).notNull(),
    coefficient: decimal("coefficient", { precision: 12, scale: 9 }).notNull(),
    uom: varchar("uom", { length: 20 }).notNull(),
    rounding: varchar("rounding", { length: 20 }).notNull().default("ceiling"),
    oracleCode: varchar("oracle_code", { length: 50 }),
    sortOrder: integer("sort_order").default(0),
});
// ═══════════════════════════════════════════
//  MASTER DATA: Line-SKU Mappings
// ═══════════════════════════════════════════
export const lineSkuMappings = pgTable("line_sku_mappings", {
    id: uuid("id").defaultRandom().primaryKey(),
    skuId: uuid("sku_id").notNull().references(() => skus.id, { onDelete: "cascade" }),
    line: varchar("line", { length: 10 }).notNull(),
}, (table) => [
    unique("uq_line_sku").on(table.skuId, table.line),
]);
// ═══════════════════════════════════════════
//  MASTER DATA: Pallet Qty Config
// ═══════════════════════════════════════════
export const palletQtyConfig = pgTable("pallet_qty_config", {
    id: uuid("id").defaultRandom().primaryKey(),
    materialName: varchar("material_name", { length: 255 }).notNull().unique(),
    qtyPerPallet: integer("qty_per_pallet").notNull(),
});
// ═══════════════════════════════════════════
//  MASTER DATA: UOM Conversions
// ═══════════════════════════════════════════
export const uomConversions = pgTable("uom_conversions", {
    id: uuid("id").defaultRandom().primaryKey(),
    uom: varchar("uom", { length: 20 }).notNull().unique(),
    unit: varchar("unit", { length: 50 }).notNull(),
    conversion: varchar("conversion", { length: 100 }),
});
