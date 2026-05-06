import { Router, Request, Response } from "express";
import * as transitService from "../services/transit.service.js";
import * as reportService from "../services/report.service.js";

const router = Router();

router.get("/info", async (_req: Request, res: Response) => {
  const data = await transitService.getTransitInfo();
  res.json(data);
});

router.get("/inventory", async (_req: Request, res: Response) => {
  const data = await transitService.getTransitInventory();
  res.json(data);
});

router.post("/receive", async (req: Request, res: Response) => {
  const { material, qtyPallet, barcode, actualPcs, source, supplier, mid, dateInGudang } = req.body;
  const result = await transitService.receiveToTransit(material, qtyPallet, barcode, actualPcs, source, undefined, supplier, undefined, mid, dateInGudang ? new Date(dateInGudang) : undefined);
  res.json(result);
});

router.post("/take", async (req: Request, res: Response) => {
  const { material, qty, line } = req.body;
  const result = await transitService.takeFromTransit(material, qty, line);
  res.json(result);
});

router.get("/stock-check/:date", async (req: Request, res: Response) => {
  const data = await transitService.getStockCheck(req.params.date);
  res.json(data);
});

router.put("/stock-check/:date", async (req: Request, res: Response) => {
  const result = await transitService.saveStockCheck(req.params.date, req.body.entries, (req as any).user?.name);
  res.json(result);
});

router.get("/mutations", async (req: Request, res: Response) => {
  const pageNum = parseInt(req.query.page as string) || 1;
  const limitNum = parseInt(req.query.limit as string) || 50;

  const filters = { 
    material: req.query.material as string, 
    startDate: req.query.startDate as string, 
    endDate: req.query.endDate as string, 
    line: req.query.line as string,
    blockId: req.query.blockId as string,
    blockRowId: req.query.blockRowId as string
  };
  const data = await transitService.getMutationReport(filters, pageNum, limitNum);
  res.json(data);
});

router.get("/report/mutation", async (req: Request, res: Response) => {
  try {
    const filters = {
      material: req.query.material as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      line: req.query.line as string,
      block: req.query.block as string,
      row: req.query.row as string,
      sku: req.query.sku as string
    };
    const data = await reportService.getTransitMutationReport(filters);
    res.json(data);
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
});

router.get("/used-barcodes", async (_req: Request, res: Response) => {
  const data = await transitService.getUsedBarcodes();
  res.json(data);
});

router.post("/outbound", async (req: Request, res: Response) => {
  const { barcode, destination, targetLine } = req.body;
  const result = await transitService.requestTransitOutbound(barcode, destination, targetLine);
  res.json(result);
});

router.post("/relocate", async (req: Request, res: Response) => {
  try {
    const { barcode, targetBlockRowId } = req.body;
    const result = await transitService.relocateTransitPallet(barcode, targetBlockRowId, (req as any).user?.name);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get("/outbound/pending", async (_req: Request, res: Response) => {
  const data = await transitService.getTransitOutboundPending();
  res.json(data);
});

router.post("/outbound/:id/verify", async (req: Request, res: Response) => {
  const result = await transitService.verifyTransitOutbound(req.params.id, req.body.action);
  res.json(result);
});

router.get("/opname", async (req: Request, res: Response) => {
  try {
    const filters = { blockId: req.query.blockId as string };
    const data = await transitService.getTransitOpnames(filters);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/opname", async (req: Request, res: Response) => {
  try {
    const result = await transitService.saveTransitOpname(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/opname/:id/item/:itemId", async (req: Request, res: Response) => {
  try {
    const { newQtyPhysical, editedBy } = req.body;
    const result = await transitService.updateTransitOpnameItem(req.params.id, req.params.itemId, newQtyPhysical, editedBy || ((req as any).user?.name));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
