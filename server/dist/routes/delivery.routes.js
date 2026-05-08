import { Router } from "express";
import * as deliveryService from "../services/delivery.service.js";
const router = Router();
router.get("/", async (_req, res) => {
    const data = await deliveryService.getActiveDeliveries();
    res.json(data);
});
router.get("/:id", async (req, res) => {
    const data = await deliveryService.getDeliveryById(req.params.id);
    if (!data) {
        res.status(404).json({ error: "Not found" });
        return;
    }
    res.json(data);
});
router.post("/create", async (req, res) => {
    const { date, shiftKey, slotId, items } = req.body;
    const data = await deliveryService.getOrCreateDelivery(date, shiftKey, slotId, items);
    res.json(data);
});
router.post("/:id/refresh", async (req, res) => {
    const { date, shiftKey, slotId, items } = req.body;
    const data = await deliveryService.refreshDelivery(date, shiftKey, slotId, items);
    res.json(data);
});
router.post("/:id/scan", async (req, res) => {
    const { material, barcode, qtyPallet, pcs, supplier, targetBlockRowId } = req.body;
    const result = await deliveryService.scanDeliveryItem(req.params.id, material, barcode, qtyPallet || 1, pcs || 0, supplier || "", targetBlockRowId || undefined);
    res.json(result);
});
router.post("/:id/validate", async (req, res) => {
    const result = await deliveryService.validateDelivery(req.params.id);
    res.json(result);
});
router.get("/barcode-check/:barcode", async (req, res) => {
    const result = await deliveryService.isBarcodeInActiveDelivery(req.params.barcode);
    res.json({ found: !!result, data: result });
});
export default router;
