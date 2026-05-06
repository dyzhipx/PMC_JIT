import { Router, Request, Response } from "express";
import * as anomalyService from "../services/anomaly.service.js";

const router = Router();

router.get("/unscanned-transit", async (req: Request, res: Response) => {
  try {
    const thresholdHours = parseFloat(req.query.hours as string) || 3;
    const data = await anomalyService.getUnscannedTransit(thresholdHours);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
