/**
 * Reset semua data TRANSAKSI ke kosong.
 * MASTER DATA yang DIPERTAHANKAN:
 *   - suppliers, skus, bom_components
 *   - block_layout, block_rows
 *   - line_sku_mappings
 *   - pallet_qty_config, uom_conversions
 */

import * as process from "node:process";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function resetTransactions() {
  console.log("=".repeat(60));
  console.log("  RESET DATA TRANSAKSI — MULAI");
  console.log("  Master data (SKU, BOM, Blok, Supplier, Line-SKU) AMAN.");
  console.log("=".repeat(60));

  const tables = [
    // Child tables first (FK constraints)
    "manual_spb_scans",
    "manual_spb_items",
    "manual_spb",
    "delivery_scans",
    "delivery_items",
    "deliveries",
    "stock_check_entries",
    "stock_checks",
    "transit_outbound_pending",
    "transit_inventory",
    "transit_stock_live",
    "stock_mutations",
    "used_barcodes",
    "warehouse_inventory",
    "schedules",
    "line_barcodes",
    "line_stock",
    "pending_returns",
  ];

  for (const table of tables) {
    try {
      const count = await prisma.$executeRawUnsafe(`DELETE FROM [dbo].[${table}]`);
      console.log(`  ✅ ${table}: ${count} rows deleted`);
    } catch (e: any) {
      if (e.meta && e.meta.code === '208') {
        console.log(`  ⏭ ${table}: tabel tidak ditemukan (skip)`);
      } else {
        console.log(`  ⚠️ ${table}: ${e.meta?.message || e.message}`);
      }
    }
  }

  console.log("");
  console.log("=".repeat(60));
  console.log("  ✅ RESET SELESAI! Semua transaksi sudah bersih.");
  console.log("  Master data (SKU, BOM, Blok, Supplier) tetap utuh.");
  console.log("=".repeat(60));
}

resetTransactions()
  .catch(err => { console.error("❌ Error:", err.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
