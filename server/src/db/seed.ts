import { db } from "../config/database.js";
import { auth } from "../config/auth.js";

async function seed() {
  console.log("🌱 Seeding database...\n");

  // ── System Counters ──
  const counters = [
    { id: "barcode_counter", value: 0 },
    { id: "mid_counter", value: 0 },
  ];
  for (const c of counters) {
    await db.systemCounter.upsert({ where: { id: c.id }, update: {}, create: c });
  }
  console.log("✅ System counters");

  // ── Demo Users (Role-Based Accounts) ──
  const demoUsers = [
    { name: "Administrator",       email: "admin@pmc.local",    password: "pmc2026!!", role: "admin" },
    { name: "PPIC Staff",          email: "ppic@pmc.local",     password: "pmc2026!!", role: "ppic" },
    { name: "Admin Transit",       email: "transit@pmc.local",  password: "pmc2026!!", role: "admin_transit" },
    { name: "Operator Gudang",     email: "gudang@pmc.local",   password: "pmc2026!!", role: "gudang" },
    { name: "Operator Line",       email: "operator@pmc.local", password: "pmc2026!!", role: "operator_line" },
    { name: "Supervisor Produksi", email: "spv@pmc.local",      password: "pmc2026!!", role: "supervisor" },
  ];

  let userCount = 0;
  for (const u of demoUsers) {
    const existing = await db.user.findFirst({ where: { email: u.email } });
    if (!existing) {
      try {
        await auth.api.signUpEmail({
          body: {
            name: u.name,
            email: u.email,
            password: u.password,
            role: u.role,
          },
        });
        userCount++;
      } catch (err: any) {
        console.warn(`  ⚠️ Gagal buat user ${u.email}: ${err.message || err}`);
      }
    }
  }
  console.log(`✅ Demo Users (${userCount} baru, ${demoUsers.length - userCount} sudah ada)`);

  // ── Suppliers ──
  const sups = [
    { code: "SUP001", name: "PT. Sumber Jaya", contact: "021-12345678", address: "Jl. Industri No. 10, Cikarang" },
    { code: "SUP002", name: "CV. Abadi Makmur", contact: "031-87654321", address: "Jl. Raya Surabaya No. 5" },
    { code: "SUP003", name: "PT. Karya Mandiri", contact: "022-11223344", address: "Jl. Bandung Raya No. 22" },
  ];
  for (const s of sups) {
    await db.supplier.upsert({ where: { code: s.code }, update: {}, create: s });
  }
  console.log("✅ Suppliers (3)");

  // ── SKUs ──
  const skuData = [
    { code: "SKU001", name: "ABC Mocca 250g", category: "Kopi", uom: "BOX" },
    { code: "SKU002", name: "ABC Susu 180g", category: "Susu", uom: "BOX" },
    { code: "SKU003", name: "XYZ Cappuccino 500g", category: "Kopi", uom: "BOX" },
    { code: "SKU004", name: "ABC Coklat 300g", category: "Susu", uom: "BOX" },
    { code: "SKU005", name: "DEF Vanilla 200g", category: "Lainnya", uom: "BOX" },
    { code: "SKU006", name: "GHI Strawberry 150g", category: "Lainnya", uom: "BOX" },
  ];
  
  for (const s of skuData) {
    await db.sku.upsert({ where: { code: s.code }, update: {}, create: s });
  }
  
  const insertedSkus = await db.sku.findMany();
  console.log(`✅ SKUs (${insertedSkus.length})`);

  // Build SKU ID Map
  const skuMap: Record<string, string> = {};
  for (const s of insertedSkus) skuMap[s.code] = s.id;

  // ── BOM Components ──
  if (insertedSkus.length > 0) {
    const bomData = [
      { skuCode: "SKU001", materials: [
        { materialName: "Karton Mocca", coefficient: "1.0", uom: "PCS", rounding: "ceiling" },
        { materialName: "Plastik Mocca", coefficient: "0.013888889", uom: "ROL", rounding: "4decimal" },
        { materialName: "OPP Warna", coefficient: "0.00222", uom: "ROL", rounding: "4decimal" },
        { materialName: "Label Mocca", coefficient: "1.0", uom: "PCS", rounding: "ceiling" },
      ]},
      { skuCode: "SKU002", materials: [
        { materialName: "Karton Susu", coefficient: "1.0", uom: "PCS", rounding: "ceiling" },
        { materialName: "Plastik Susu", coefficient: "0.011111", uom: "ROL", rounding: "4decimal" },
        { materialName: "OPP Warna", coefficient: "0.00222", uom: "ROL", rounding: "4decimal" },
      ]},
      { skuCode: "SKU003", materials: [
        { materialName: "Karton Cappuccino", coefficient: "1.0", uom: "PCS", rounding: "ceiling" },
        { materialName: "Plastik Cappuccino", coefficient: "0.016667", uom: "ROL", rounding: "4decimal" },
        { materialName: "Label Cappuccino", coefficient: "1.0", uom: "PCS", rounding: "ceiling" },
      ]},
      { skuCode: "SKU004", materials: [
        { materialName: "Karton Coklat", coefficient: "1.0", uom: "PCS", rounding: "ceiling" },
        { materialName: "Plastik Coklat", coefficient: "0.01250", uom: "ROL", rounding: "4decimal" },
        { materialName: "Label Coklat", coefficient: "1.0", uom: "PCS", rounding: "ceiling" },
      ]},
      { skuCode: "SKU005", materials: [
        { materialName: "Karton Vanilla", coefficient: "1.0", uom: "PCS", rounding: "ceiling" },
        { materialName: "Plastik Vanilla", coefficient: "0.01000", uom: "ROL", rounding: "4decimal" },
      ]},
      { skuCode: "SKU006", materials: [
        { materialName: "Karton Strawberry", coefficient: "1.0", uom: "PCS", rounding: "ceiling" },
        { materialName: "Plastik Strawberry", coefficient: "0.00833", uom: "ROL", rounding: "4decimal" },
        { materialName: "OPP Warna", coefficient: "0.00180", uom: "ROL", rounding: "4decimal" },
      ]},
    ];

    let bomCount = 0;
    for (const bom of bomData) {
      const skuId = skuMap[bom.skuCode];
      if (!skuId) continue;
      for (let i = 0; i < bom.materials.length; i++) {
        const mat = bom.materials[i];
        const exist = await db.bomComponent.findFirst({ where: { skuId, materialName: mat.materialName } });
        if (!exist) {
          await db.bomComponent.create({ data: { skuId, ...mat, sortOrder: i } });
          bomCount++;
        }
      }
    }
    console.log(`✅ BOM Components (${bomCount})`);
  }

  // ── Line-SKU Mappings ──
  const lineData = [
    { skuCode: "SKU001", line: "A" }, { skuCode: "SKU001", line: "B" },
    { skuCode: "SKU002", line: "A" }, { skuCode: "SKU003", line: "B" },
    { skuCode: "SKU004", line: "A" }, { skuCode: "SKU005", line: "A" },
    { skuCode: "SKU006", line: "B" },
  ];
  let lineCount = 0;
  for (const l of lineData) {
    const skuId = skuMap[l.skuCode];
    if (!skuId) continue;
    const exist = await db.lineSkuMapping.findFirst({ where: { skuId, line: l.line } });
    if (!exist) {
      await db.lineSkuMapping.create({ data: { skuId, line: l.line } });
      lineCount++;
    }
  }
  console.log(`✅ Line-SKU Mappings (${lineCount})`);

  // ── Pallet Qty Config ──
  const palletData = [
    { materialName: "Karton Mocca", qtyPerPallet: 500 },
    { materialName: "Karton Susu", qtyPerPallet: 500 },
    { materialName: "Karton Cappuccino", qtyPerPallet: 400 },
    { materialName: "Karton Coklat", qtyPerPallet: 450 },
    { materialName: "Karton Vanilla", qtyPerPallet: 500 },
    { materialName: "Karton Strawberry", qtyPerPallet: 500 },
    { materialName: "Plastik Mocca", qtyPerPallet: 5 },
    { materialName: "Plastik Susu", qtyPerPallet: 5 },
    { materialName: "Plastik Cappuccino", qtyPerPallet: 5 },
    { materialName: "Plastik Coklat", qtyPerPallet: 5 },
    { materialName: "Plastik Vanilla", qtyPerPallet: 5 },
    { materialName: "Plastik Strawberry", qtyPerPallet: 5 },
    { materialName: "OPP Warna", qtyPerPallet: 10 },
    { materialName: "Label Mocca", qtyPerPallet: 1000 },
    { materialName: "Label Cappuccino", qtyPerPallet: 1000 },
    { materialName: "Label Coklat", qtyPerPallet: 1000 },
  ];
  for (const p of palletData) {
    await db.palletQtyConfig.upsert({ where: { materialName: p.materialName }, update: {}, create: p });
  }
  console.log(`✅ Pallet Qty Config (${palletData.length})`);

  // ── UOM Conversions ──
  const uoms = [
    { uom: "ROL", unit: "1 Roll", conversion: "1000 meter" },
    { uom: "PCS", unit: "1 Pieces", conversion: "-" },
    { uom: "KG", unit: "1 Kilogram", conversion: "1000 gram" },
    { uom: "LBR", unit: "1 Lembar", conversion: "-" },
  ];
  for (const u of uoms) {
    await db.uomConversion.upsert({ where: { uom: u.uom }, update: {}, create: u });
  }
  console.log("✅ UOM Conversions (4)");

  // ── Demo Schedules ──
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

  if (Object.keys(skuMap).length > 0) {
    const schedData = [
      { date: fmt(yesterday), line: "A", skuId: skuMap["SKU001"], sh1: 400, sh2: 350, sh3: 250, status: "converted" },
      { date: fmt(yesterday), line: "A", skuId: skuMap["SKU002"], sh1: 200, sh2: 300, sh3: 200, status: "converted" },
      { date: fmt(yesterday), line: "B", skuId: skuMap["SKU001"], sh1: 150, sh2: 200, sh3: 150, status: "converted" },
      { date: fmt(yesterday), line: "B", skuId: skuMap["SKU003"], sh1: 300, sh2: 200, sh3: 250, status: "converted" },
      { date: fmt(today), line: "A", skuId: skuMap["SKU004"], sh1: 350, sh2: 400, sh3: 300, status: "pending" },
      { date: fmt(today), line: "A", skuId: skuMap["SKU005"], sh1: 250, sh2: 200, sh3: 180, status: "pending" },
      { date: fmt(today), line: "B", skuId: skuMap["SKU006"], sh1: 500, sh2: 450, sh3: 400, status: "pending" },
      { date: fmt(tomorrow), line: "A", skuId: skuMap["SKU001"], sh1: 600, sh2: 550, sh3: 500, status: "pending" },
      { date: fmt(tomorrow), line: "B", skuId: skuMap["SKU002"], sh1: 300, sh2: 350, sh3: 250, status: "pending" },
    ].filter(s => s.skuId);

    for (const sd of schedData) {
        const exist = await db.schedule.findFirst({
            where: { date: new Date(sd.date), line: sd.line, skuId: sd.skuId }
        });
        if (!exist) {
            await db.schedule.create({ data: { date: new Date(sd.date), line: sd.line, skuId: sd.skuId as string, sh1: sd.sh1, sh2: sd.sh2, sh3: sd.sh3, status: sd.status } });
        }
    }
    console.log(`✅ Schedules (${schedData.length})`);
  }

  console.log("\n🎉 Seed completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
