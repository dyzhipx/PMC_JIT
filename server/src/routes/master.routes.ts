import { Router, Request, Response } from "express";
import * as masterService from "../services/master.service.js";

const router = Router();

// ── SKU ──
router.get("/sku", async (_req: Request, res: Response) => {
  const data = await masterService.getAllSkus();
  res.json(data);
});

router.post("/sku", async (req: Request, res: Response, next) => {
  try {
    console.log("Creating SKU with body:", JSON.stringify(req.body, null, 2));
    const sku = await masterService.createSku(req.body);
    res.status(201).json(sku);
  } catch (err) {
    next(err);
  }
});

router.put("/sku/:id", async (req: Request, res: Response, next) => {
  try {
    const sku = await masterService.updateSku(req.params.id, req.body);
    res.json(sku);
  } catch (err) {
    next(err);
  }
});

router.delete("/sku/:id", async (req: Request, res: Response, next) => {
  try {
    await masterService.deleteSku(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ── BOM ──
router.get("/bom", async (_req: Request, res: Response) => {
  const data = await masterService.getAllBoms();
  res.json(data);
});

router.get("/bom/:skuId", async (req: Request, res: Response) => {
  const data = await masterService.getBomBySkuId(req.params.skuId);
  res.json(data);
});

router.post("/bom/:skuId/component", async (req: Request, res: Response, next) => {
  try {
    const comp = await masterService.addBomComponent(req.params.skuId, req.body);
    res.status(201).json(comp);
  } catch(err) { next(err); }
});

router.put("/bom/component/:id", async (req: Request, res: Response) => {
  const comp = await masterService.updateBomComponent(req.params.id, req.body);
  res.json(comp);
});

router.delete("/bom/component/:id", async (req: Request, res: Response) => {
  await masterService.deleteBomComponent(req.params.id);
  res.json({ success: true });
});

// ── Supplier ──
router.get("/supplier", async (_req: Request, res: Response) => {
  const data = await masterService.getAllSuppliers();
  res.json(data);
});

router.post("/supplier", async (req: Request, res: Response, next) => {
  try {
    const sup = await masterService.createSupplier(req.body);
    res.status(201).json(sup);
  } catch(err) { next(err); }
});

router.put("/supplier/:id", async (req: Request, res: Response, next) => {
  try {
    const sup = await masterService.updateSupplier(req.params.id, req.body);
    res.json(sup);
  } catch(err) { next(err); }
});

router.delete("/supplier/:id", async (req: Request, res: Response, next) => {
  try {
    await masterService.deleteSupplier(req.params.id);
    res.json({ success: true });
  } catch(err) { next(err); }
});

// ── Line-SKU Mapping ──
router.get("/line-sku", async (_req: Request, res: Response) => {
  const data = await masterService.getAllLineSkuMappings();
  res.json(data);
});

router.post("/line-sku", async (req: Request, res: Response, next) => {
  try {
    const mapping = await masterService.addLineSkuMapping(req.body.skuId, req.body.line);
    res.status(201).json(mapping);
  } catch(err) { next(err); }
});

router.delete("/line-sku/:skuId/:line", async (req: Request, res: Response) => {
  await masterService.deleteLineSkuMapping(req.params.skuId, req.params.line);
  res.json({ success: true });
});

// ── Pallet Qty ──
router.get("/pallet-qty", async (_req: Request, res: Response, next) => {
  try {
    const data = await masterService.getAllPalletQty();
    res.json(data);
  } catch(err) { next(err); }
});

router.put("/pallet-qty/:material", async (req: Request, res: Response, next) => {
  try {
    const result = await masterService.setPalletQty(req.params.material, req.body.qtyPerPallet);
    res.json(result);
  } catch(err) { next(err); }
});

// ── UOM ──
router.get("/uom", async (_req: Request, res: Response, next) => {
  try {
    const data = await masterService.getAllUom();
    res.json(data);
  } catch(err) { next(err); }
});

// ── Block Layout ──
router.get("/block-layout", async (_req: Request, res: Response, next) => {
  try {
    const data = await masterService.getFullBlockLayout();
    res.json(data);
  } catch(err) { next(err); }
});

router.put("/block-layout", async (req: Request, res: Response, next) => {
  try {
    await masterService.saveFullBlockLayout(req.body.layout);
    res.json({ success: true });
  } catch(err) { next(err); }
});

// ── Material Receh ──
router.get("/material-receh", async (_req: Request, res: Response, next) => {
  try {
    const data = await masterService.getMaterialReceh();
    res.json(data);
  } catch(err) { next(err); }
});

router.post("/material-receh", async (req: Request, res: Response, next) => {
  try {
    const result = await masterService.addMaterialReceh(req.body.materialName);
    res.json(result);
  } catch(err) { next(err); }
});

router.delete("/material-receh/:materialName", async (req: Request, res: Response, next) => {
  try {
    const materialName = decodeURIComponent(req.params.materialName);
    const result = await masterService.removeMaterialReceh(materialName);
    res.json(result);
  } catch(err) { next(err); }
});

// ── Kamus Opname ──
router.get("/kamus-opname", async (_req: Request, res: Response, next) => {
  try {
    const data = await masterService.getAllKamusOpname();
    res.json(data);
  } catch(err) { next(err); }
});

router.post("/kamus-opname", async (req: Request, res: Response, next) => {
  try {
    const item = await masterService.createKamusOpname(req.body);
    res.status(201).json(item);
  } catch(err) { next(err); }
});

router.put("/kamus-opname/:id", async (req: Request, res: Response, next) => {
  try {
    const item = await masterService.updateKamusOpname(req.params.id, req.body);
    res.json(item);
  } catch(err) { next(err); }
});

router.delete("/kamus-opname/:id", async (req: Request, res: Response, next) => {
  try {
    await masterService.deleteKamusOpname(req.params.id);
    res.json({ success: true });
  } catch(err) { next(err); }
});

router.post("/kamus-opname/delete-multiple", async (req: Request, res: Response, next) => {
  try {
    const result = await masterService.deleteMultipleKamusOpname(req.body.ids);
    res.json(result);
  } catch(err) { next(err); }
});

export default router;

