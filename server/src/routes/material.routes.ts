import { Router, Request, Response } from "express";
import * as materialService from "../services/material.service.js";

const router = Router();

router.get("/requirements/:date", async (req: Request, res: Response) => {
  const data = await materialService.getMaterialRequirements(req.params.date);
  res.json(data);
});

router.get("/line-requirements/:date", async (req: Request, res: Response) => {
  const data = await materialService.getLineMaterialRequirements(req.params.date);
  res.json(data);
});

router.get("/hourly-distribution/:date", async (req: Request, res: Response) => {
  const data = await materialService.getHourlyDistribution(req.params.date);
  res.json(data);
});

export default router;
