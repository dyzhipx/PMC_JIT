import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import * as productionService from "../services/production.service.js";
import * as reportService from "../services/report.service.js";
const router = Router();

router.get("/stock", async (_req: Request, res: Response, next) => {
  try {
    const data = await productionService.getLineStockAll();
    res.json(data);
  } catch(err) { next(err); }
});

router.get("/stock/:line", async (req: Request, res: Response, next) => {
  try {
    const data = await productionService.getLineStockByLine(req.params.line);
    res.json(data);
  } catch(err) { next(err); }
});

router.get("/barcodes", async (req: Request, res: Response, next) => {
  try {
    const data = await productionService.getLineBarcodes(req.query.line as string);
    res.json(data);
  } catch(err) { next(err); }
});

router.post("/receive", async (req: Request, res: Response, next) => {
  try {
    const { line, material, barcode, pcs } = req.body;
    const result = await productionService.receiveToLine(line, material, barcode, pcs);
    res.json(result);
  } catch(err) { next(err); }
});

router.post("/receive-partial", async (req: Request, res: Response, next) => {
  try {
    const { line, material, barcode, pcs } = req.body;
    const result = await productionService.receivePartialToLine(line, material, barcode, pcs);
    res.json(result);
  } catch(err) { next(err); }
});

router.post("/return", async (req: Request, res: Response, next) => {
  try {
    const { barcode, pcs, targetBlockRowId, condition } = req.body;
    const result = await productionService.returnFromLine(barcode, pcs, targetBlockRowId, condition);
    res.json(result);
  } catch(err) { next(err); }
});

router.post("/return-sisa", async (req: Request, res: Response, next) => {
  try {
    const { line, materialName, pcs, targetBlockRowId } = req.body;
    const result = await productionService.returnSisaFromLine(line, materialName, pcs, targetBlockRowId);
    res.json(result);
  } catch(err) { next(err); }
});

router.get("/returns/pending", async (_req: Request, res: Response, next) => {
  try {
    const data = await productionService.getPendingReturns();
    res.json(data);
  } catch(err) { next(err); }
});

router.post("/returns/:id/verify", async (req: Request, res: Response, next) => {
  try {
    const result = await productionService.verifyReturn(req.params.id, req.body.action);
    res.json(result);
  } catch(err) { next(err); }
});

router.get("/external/:dest", async (req: Request, res: Response, next) => {
  try {
    const data = await productionService.getExternalOnhand(req.params.dest);
    res.json(data);
  } catch(err) { next(err); }
});
router.post("/reject", async (req: Request, res: Response, next) => {
  try {
    const { line, materialName, pcs, reason } = req.body;
    const result = await productionService.processLineReject(line, materialName, pcs, reason);
    res.json(result);
  } catch(err) { next(err); }
});

router.post("/reject/:id/verify", async (req: Request, res: Response, next) => {
  try {
    const { action, finalPcs } = req.body;
    const result = await productionService.verifyLineReject(req.params.id, action, finalPcs);
    res.json(result);
  } catch(err) { next(err); }
});

router.get("/reject", async (req: Request, res: Response, next) => {
  try {
    const data = await productionService.getLineRejects(req.query.date as string);
    res.json(data);
  } catch(err) { next(err); }
});

// ── Opname Routes ──
router.post("/opname", async (req: Request, res: Response, next) => {
  try {
    const result = await productionService.saveLineOpname(req.body);
    res.json(result);
  } catch(err) { next(err); }
});

router.get("/opname", async (req: Request, res: Response, next) => {
  try {
    const data = await productionService.getLineOpnames({
      line: req.query.line as string,
      type: req.query.type as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string
    });
    res.json(data);
  } catch(err) { next(err); }
});

router.put("/opname/:opnameId/item/:itemId", async (req: Request, res: Response, next) => {
  try {
    const { opnameId, itemId } = req.params;
    const { newQtyPhysical, editedBy } = req.body;
    const result = await productionService.updateLineOpnameItem(opnameId, itemId, parseFloat(newQtyPhysical), editedBy || 'Auditor');
    res.json(result);
  } catch(err) { next(err); }
});

// ── Line Mutations Route ──
router.get("/mutations", async (req: Request, res: Response, next) => {
  try {
    const pageNum = parseInt(req.query.page as string) || 1;
    const limitNum = parseInt(req.query.limit as string) || 50;

    const data = await productionService.getLineMutations({
      material: req.query.material as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      line: req.query.line as string
    }, pageNum, limitNum);
    
    // Now data is { data: [...], metadata: { ... } }
    res.json(data);
  } catch(err) { next(err); }
});

router.get("/report/mutation", async (req: Request, res: Response, next) => {
  try {
    const data = await reportService.getProductionMutationReport({
      material: req.query.material as string,
      line: req.query.line as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string
    });
    res.json(data);
  } catch(err) { next(err); }
});

export default router;
