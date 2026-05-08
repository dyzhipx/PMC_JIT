import { pgTable, uuid, varchar, integer, date, timestamp } from "drizzle-orm/pg-core";
// ═══════════════════════════════════════════
//  PRODUCTION SCHEDULES
// ═══════════════════════════════════════════
export const schedules = pgTable("schedules", {
    id: uuid("id").defaultRandom().primaryKey(),
    date: date("date").notNull(),
    line: varchar("line", { length: 10 }).notNull(),
    skuId: varchar("sku_id", { length: 50 }).notNull(),
    sh1: integer("sh1").notNull().default(0),
    sh2: integer("sh2").notNull().default(0),
    sh3: integer("sh3").notNull().default(0),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow(),
});
