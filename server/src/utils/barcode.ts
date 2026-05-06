import { db } from "../config/database.js";

/**
 * Get next barcode range by atomically incrementing the counter.
 */
export async function getNextBarcodeRange(count: number): Promise<{ start: string; end: string; barcodes: string[] }> {
  const result = await db.systemCounter.update({
    where: { id: "barcode_counter" },
    data: { value: { increment: count } }
  });

  let endValue = result.value ?? count;
  let startValue = endValue - count + 1;

  const barcodes: string[] = [];
  for (let i = startValue; i <= endValue; i++) {
    barcodes.push(String(i).padStart(5, "0"));
  }

  return {
    start: String(startValue).padStart(5, "0"),
    end: String(endValue).padStart(5, "0"),
    barcodes,
  };
}

/**
 * Get next MID (Material ID) atomically.
 */
export async function getNextMID(): Promise<string> {
  const result = await db.systemCounter.update({
    where: { id: "mid_counter" },
    data: { value: { increment: 1 } }
  });

  const counter = result.value ?? 1;
  const now = new Date();
  const dateStr =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");

  return `MID-${dateStr}-${String(counter).padStart(3, "0")}`;
}
