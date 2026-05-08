import { Router } from "express";
import * as transitService from "../services/transit.service.js";
import * as reportService from "../services/report.service.js";
const router = Router();
router.get("/info", async (_req, res) => {
    const data = await transitService.getTransitInfo();
    res.json(data);
});
router.get("/inventory", async (_req, res) => {
    const data = await transitService.getTransitInventory();
    res.json(data);
});
router.post("/receive", async (req, res) => {
    const { material, qtyPallet, barcode, actualPcs, source, supplier, mid, dateInGudang } = req.body;
    const result = await transitService.receiveToTransit(material, qtyPallet, barcode, actualPcs, source, undefined, supplier, undefined, mid, dateInGudang ? new Date(dateInGudang) : undefined);
    res.json(result);
});
router.post("/take", async (req, res) => {
    const { material, qty, line } = req.body;
    const result = await transitService.takeFromTransit(material, qty, line);
    res.json(result);
});
router.get("/stock-check/:date", async (req, res) => {
    const data = await transitService.getStockCheck(req.params.date);
    res.json(data);
});
router.put("/stock-check/:date", async (req, res) => {
    const result = await transitService.saveStockCheck(req.params.date, req.body.entries, req.user?.name);
    res.json(result);
});
router.get("/mutations", async (req, res) => {
    const pageNum = parseInt(req.query.page) || 1;
    const limitNum = parseInt(req.query.limit) || 50;
    const filters = {
        material: req.query.material,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        line: req.query.line,
        blockId: req.query.blockId,
        blockRowId: req.query.blockRowId
    };
    const data = await transitService.getMutationReport(filters, pageNum, limitNum);
    res.json(data);
});
router.get("/report/mutation", async (req, res) => {
    try {
        const filters = {
            material: req.query.material,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            line: req.query.line,
            block: req.query.block,
            row: req.query.row,
            sku: req.query.sku
        };
        const data = await reportService.getTransitMutationReport(filters);
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.get("/used-barcodes", async (_req, res) => {
    const data = await transitService.getUsedBarcodes();
    res.json(data);
});
router.post("/outbound", async (req, res) => {
    const { barcode, destination, targetLine } = req.body;
    const result = await transitService.requestTransitOutbound(barcode, destination, targetLine);
    res.json(result);
});
router.post("/relocate", async (req, res) => {
    try {
        const { barcode, targetBlockRowId } = req.body;
        const result = await transitService.relocateTransitPallet(barcode, targetBlockRowId, req.user?.name);
        res.json(result);
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
router.get("/outbound/pending", async (_req, res) => {
    const data = await transitService.getTransitOutboundPending();
    res.json(data);
});
router.post("/outbound/:id/verify", async (req, res) => {
    const result = await transitService.verifyTransitOutbound(req.params.id, req.body.action);
    res.json(result);
});
router.get("/opname", async (req, res) => {
    try {
        const filters = { blockId: req.query.blockId };
        const data = await transitService.getTransitOpnames(filters);
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.post("/opname", async (req, res) => {
    try {
        const result = await transitService.saveTransitOpname(req.body);
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.put("/opname/:id/item/:itemId", async (req, res) => {
    try {
        const { newQtyPhysical, editedBy } = req.body;
        const result = await transitService.updateTransitOpnameItem(req.params.id, req.params.itemId, newQtyPhysical, editedBy || (req.user?.name));
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
export default router;
