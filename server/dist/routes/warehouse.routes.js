import { Router } from "express";
import * as warehouseService from "../services/warehouse.service.js";
const router = Router();
router.get("/stock", async (_req, res) => {
    try {
        const data = await warehouseService.getWarehouseStock();
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to get stock" });
    }
});
router.get("/counters", async (_req, res) => {
    try {
        const data = await warehouseService.getCounters();
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to get counters" });
    }
});
router.post("/stock", async (req, res, next) => {
    try {
        const result = await warehouseService.addWarehouseStock(req.body);
        res.status(201).json(result);
    }
    catch (err) {
        next(err);
    }
});
router.post("/consume", async (req, res, next) => {
    try {
        const { material, qtyPallet, barcode } = req.body;
        const result = await warehouseService.consumeFromWMS(material, qtyPallet, barcode);
        res.json({ success: true, consumed: result });
    }
    catch (err) {
        next(err);
    }
});
router.delete("/stock/:id", async (req, res, next) => {
    try {
        await warehouseService.deleteWarehouseStock(req.params.id);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
});
router.post("/outbound", async (req, res, next) => {
    try {
        const { barcode, destination } = req.body;
        if (!barcode || !destination) {
            return res.status(400).json({ success: false, message: "Barcode dan tujuan (destination) wajib diisi." });
        }
        const result = await warehouseService.requestWarehouseOutbound(barcode, destination);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
export default router;
