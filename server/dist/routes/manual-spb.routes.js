import { Router } from "express";
import * as manualSpbService from "../services/manual-spb.service.js";
const router = Router();
// GET /api/manual-spb - List all Manual SPBs
router.get("/", async (req, res) => {
    try {
        const status = req.query.status;
        const pageNum = parseInt(req.query.page) || 1;
        const limitNum = parseInt(req.query.limit) || 50;
        const result = await manualSpbService.getManualSpbs(status, pageNum, limitNum);
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET /api/manual-spb/:id - Get single SPB
router.get("/:id", async (req, res) => {
    try {
        const data = await manualSpbService.getManualSpbById(req.params.id);
        if (!data) {
            res.status(404).json({ error: "Not found" });
            return;
        }
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// POST /api/manual-spb - Create new Manual SPB
router.post("/", async (req, res) => {
    try {
        const { requestedBy, reason, items, targetDate, targetShift } = req.body;
        if (!requestedBy || !items || items.length === 0) {
            res.status(400).json({ success: false, message: "Data tidak lengkap" });
            return;
        }
        const data = await manualSpbService.createManualSpb(requestedBy, reason || "", items, targetDate, targetShift);
        res.json({ success: true, data, message: `SPB Manual ${data.spbNumber} berhasil dibuat` });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
// POST /api/manual-spb/:itemId/process - Process/scan an item
router.post("/:itemId/process", async (req, res) => {
    try {
        const { barcode, pcs, supplier, targetBlockRowId } = req.body;
        const result = await manualSpbService.processSpbItem(req.params.itemId, barcode || "-", pcs || 0, supplier || "-", targetBlockRowId);
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
// GET /api/manual-spb/receive - Check barcode status
router.get("/receive", async (req, res) => {
    try {
        const { barcode } = req.query;
        if (!barcode) {
            res.status(400).json({ error: "Barcode missing" });
            return;
        }
        const scan = await manualSpbService.getManualSpbScanByBarcode(barcode);
        if (!scan) {
            res.json(null);
            return;
        }
        res.json(scan);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// POST /api/manual-spb/receive - Receive barcode at transit
router.post("/receive", async (req, res) => {
    try {
        const { barcode, actualPcs } = req.body;
        if (!barcode) {
            res.status(400).json({ success: false, message: "Barcode missing" });
            return;
        }
        const result = await manualSpbService.receiveSpbScan(barcode, actualPcs || 0);
        // If not a manual SPB scan, result will be null
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
// DELETE /api/manual-spb/:id - Delete SPB
router.delete("/:id", async (req, res) => {
    try {
        const result = await manualSpbService.deleteManualSpb(req.params.id);
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
export default router;
