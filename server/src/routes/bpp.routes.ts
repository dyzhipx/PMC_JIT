import { Router } from "express";
import * as bppService from "../services/bpp.service.js";

const router = Router();

router.get("/verify-sku", async (req, res) => {
  try {
    const { date, line, skuId } = req.query;
    if (!date || !line || !skuId) {
      return res.status(400).json({ success: false, message: "Date, line, and skuId are required" });
    }
    const result = await bppService.verifySkuAgainstSchedule(String(date), String(line), String(skuId));
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/submit", async (req, res) => {
  try {
    const result = await bppService.submitBpp(req.body);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/history", async (req, res) => {
  try {
    const { date, page, limit } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50;
    
    // getBppHistory returns { data, metadata } instead of just an array now
    const result = await bppService.getBppHistory(date as string, pageNum, limitNum);
    
    res.json({ success: true, data: result.data, metadata: result.metadata });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { qty, skuId } = req.body;
    const result = await bppService.editBpp(id, Number(qty), String(skuId));
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
