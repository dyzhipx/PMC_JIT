import { db } from "../config/database.js";
import { todayStr, nowTimeStr } from "../utils/format.js";
import * as scheduleService from "./schedule.service.js";
import * as masterService from "./master.service.js";

// Verify whether the input SKU matches the schedule for the given date & line
export async function verifySkuAgainstSchedule(date: string, line: string, skuId: string) {
  // Query schedules for this date and line
  const schedules = await db.schedule.findMany({
    where: {
      date: new Date(date),
      line: line
    }
  });

  // If there's no schedule at all, maybe we warn them or allow it?
  if (schedules.length === 0) {
    return {
      match: false,
      message: `Tidak ada jadwal produksi untuk Line ${line} pada tanggal ${date}.`
    };
  }

  const matchingSchedule = schedules.find(s => s.skuId === skuId);
  if (!matchingSchedule) {
    const scheduledSkus = schedules.map(s => s.skuId).join(", ");
    return {
      match: false,
      message: `SKU yang diinput (${skuId}) TIDAK SAMA dengan Jadwal! Jadwal hari ini: ${scheduledSkus}`
    };
  }

  return {
    match: true,
    message: "SKU sesuai dengan Jadwal Produksi."
  };
}

// Ensure the generate ID is unique or rely on Prisma's UUID
function generateBppNumber(line: string) {
  const timestamp = Date.now().toString().slice(-6);
  return `BPP-${line}-${timestamp}`;
}

export async function submitBpp(data: {
  bppNumber?: string;
  line: string;
  skuId: string;
  qty: number;
  shift?: number;
  date: string;
}) {
  const { line, skuId, qty, shift, date } = data;
  const bppNumber = data.bppNumber || generateBppNumber(line);

  // 1. Fetch BOM for the given SKU
  const bomComponents = await db.bomComponent.findMany({
    where: { skuId: skuId }
  });

  if (!bomComponents || bomComponents.length === 0) {
    throw new Error(`Tidak ada BOM (resep material) yang ditemukan untuk SKU ${skuId}. Pastikan Master BOM sudah diisi.`);
  }

  // 2. Wrap in transaction
  return db.$transaction(async (tx: any) => {
    // a. Create the BPP Record
    const bpp = await tx.productionBpp.create({
      data: {
        bppNumber,
        line,
        skuId,
        qty,
        shift: shift || 1,
        date: new Date(date),
        status: "verified"
      }
    });

    const bppItems = [];
    const timeStr = nowTimeStr();

    // b. Deduct each BOM material from the LineStock
    for (const bom of bomComponents) {
      // Calculate required quantity
      // bom.coefficient is Decimal, qty is Int
      const coefficient = parseFloat(String(bom.coefficient));
      const requiredQty = coefficient * qty;

      // Deduct from LineStock
      const lineStock = await tx.lineStock.findFirst({
        where: { line, materialName: bom.materialName }
      });

      let currentPcs = 0;
      let currentPallets = 0;
      if (lineStock) {
        currentPcs = parseFloat(String(lineStock.pcs || "0"));
        currentPallets = lineStock.qtyPallets;
      }

      // FIFO Deduction from LineBarcode
      const barcodes = await tx.lineBarcode.findMany({
        where: { line, materialName: bom.materialName },
        orderBy: { timeIn: "asc" }
      });

      let remainingToDeduct = requiredQty;
      let palletsDeducted = 0;

      for (const bcd of barcodes) {
        if (remainingToDeduct <= 0) break;

        const barcodePcs = parseFloat(String(bcd.pcs || "0"));
        if (barcodePcs <= remainingToDeduct) {
          remainingToDeduct -= barcodePcs;
          palletsDeducted += 1;
          await tx.lineBarcode.delete({ where: { id: bcd.id } });
        } else {
          const updatedPcs = barcodePcs - remainingToDeduct;
          await tx.lineBarcode.update({
            where: { id: bcd.id },
            data: { pcs: String(updatedPcs) }
          });
          remainingToDeduct = 0;
        }
      }

      // Update LineStock (allow negative pcs)
      const newPcs = currentPcs - requiredQty;
      const newQtyPallets = Math.max(0, currentPallets - palletsDeducted);

      if (lineStock) {
        await tx.lineStock.update({
          where: { id: lineStock.id },
          data: { 
            pcs: String(newPcs),
            qtyPallets: newQtyPallets
          }
        });
      } else {
        await tx.lineStock.create({
          data: {
            line,
            materialName: bom.materialName,
            qtyPallets: 0, // Pallets start at 0 if no barcodes existed
            pcs: String(newPcs)
          }
        });
      }

      // Record in BPP Items
      const bppItem = await tx.productionBppItem.create({
        data: {
          productionBppId: bpp.id,
          materialName: bom.materialName,
          qtyDeducted: String(requiredQty)
        }
      });
      bppItems.push(bppItem);

      // Record Stock Mutation
      await tx.stockMutation.create({
        data: {
          date: new Date(date),
          time: new Date(`1970-01-01T${timeStr.length === 5 ? timeStr + ":00" : timeStr}Z`),
          type: "CONSUME",
          source: "PROD_BPP",
          materialName: bom.materialName,
          qty: String(requiredQty),
          uom: bom.uom || "PCS",
          line,
          skuId,
          barcode: bppNumber
        }
      });
    }

    return { bpp, items: bppItems };
  }, { timeout: 20000 });
}

export async function getBppHistory(dateStr?: string, page: number = 1, limit: number = 50) {
  const where: any = {};
  if (dateStr) {
    where.date = new Date(dateStr);
  }
  
  const skip = (page - 1) * limit;

  const [data, totalCount] = await Promise.all([
    db.productionBpp.findMany({
      where,
      include: {
        items: true
      },
      orderBy: {
        createdAt: "desc"
      },
      skip,
      take: limit
    }),
    db.productionBpp.count({ where })
  ]);

  return {
    data,
    metadata: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    }
  };
}

// Edit BPP -> If they edit, we need to reverse previous deduction and re-apply
export async function editBpp(id: string, newQty: number, newSkuId: string) {
  return db.$transaction(async (tx: any) => {
    const existing = await tx.productionBpp.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!existing) throw new Error("BPP tidak ditemukan");

    const line = existing.line;
    // Reverse old deduction
    for (const item of existing.items) {
      const lineStock = await tx.lineStock.findFirst({
        where: { line, materialName: item.materialName }
      });
      if (lineStock) {
        const reversedPcs = parseFloat(String(lineStock.pcs || "0")) + parseFloat(String(item.qtyDeducted));
        await tx.lineStock.update({
          where: { id: lineStock.id },
          data: { pcs: String(reversedPcs) }
        });
      }
      
      // We could add a mutation reversing it, but modifying line stock is the main deal
    }

    // Delete old items
    await tx.productionBppItem.deleteMany({ where: { productionBppId: id } });

    // Deduct new items
    const bomComponents = await tx.bomComponent.findMany({
      where: { skuId: newSkuId }
    });

    if (!bomComponents || bomComponents.length === 0) {
      throw new Error(`Tidak ada BOM (resep material) yang ditemukan untuk SKU ${newSkuId}.`);
    }

    const newItems = [];
    for (const bom of bomComponents) {
      const coefficient = parseFloat(String(bom.coefficient));
      const requiredQty = coefficient * newQty;

      const lineStock = await tx.lineStock.findFirst({
        where: { line, materialName: bom.materialName }
      });

      let currentPcs = 0;
      if (lineStock) {
         currentPcs = parseFloat(String(lineStock.pcs || "0"));
      }

      const newPcs = currentPcs - requiredQty;
      if (lineStock) {
        await tx.lineStock.update({
          where: { id: lineStock.id },
          data: { pcs: String(newPcs) }
        });
      } else {
        await tx.lineStock.create({
          data: { line, materialName: bom.materialName, qtyPallets: 0, pcs: String(newPcs) }
        });
      }

      const newItem = await tx.productionBppItem.create({
        data: {
          productionBppId: id,
          materialName: bom.materialName,
          qtyDeducted: String(requiredQty)
        }
      });
      newItems.push(newItem);
    }

    // Update BPP Record
    const updated = await tx.productionBpp.update({
      where: { id },
      data: { qty: newQty, skuId: newSkuId, status: "edited" }
    });

    return { bpp: updated, items: newItems };
  }, { timeout: 20000 });
}
