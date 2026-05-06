import { Router, Request, Response } from "express";
import * as dashboardService from "../services/dashboard.service.js";

const router = Router();

router.get("/stats", async (_req: Request, res: Response) => {
  const data = await dashboardService.getStats();
  res.json(data);
});

router.get("/daily-production", async (_req: Request, res: Response) => {
  const data = await dashboardService.getDailyProduction();
  res.json(data);
});

router.get("/recent-schedules", async (_req: Request, res: Response) => {
  const data = await dashboardService.getRecentSchedules();
  res.json(data);
});

export default router;
