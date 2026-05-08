import { Router } from "express";
import * as anomalyService from "../services/anomaly.service.js";
const router = Router();
router.get("/unscanned-transit", async (req, res) => {
    try {
        const thresholdHours = parseFloat(req.query.hours) || 3;
        const data = await anomalyService.getUnscannedTransit(thresholdHours);
        res.json({ success: true, data });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
export default router;
