import { Router } from "express";
import { getOpnameRecapPivot } from "../services/opname.service.js";

const router = Router();

router.get("/recap", async (req, res) => {
  try {
    const { startDate, endDate, area } = req.query;
    const data = await getOpnameRecapPivot({
      startDate: startDate as string,
      endDate: endDate as string,
      area: area as string,
    });
    res.json(data);
  } catch (error: any) {
    console.error("Error getting opname recap:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
