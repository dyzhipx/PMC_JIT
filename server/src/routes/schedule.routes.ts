import { Router, Request, Response } from "express";
import * as scheduleService from "../services/schedule.service.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const filters = { date: req.query.date as string, line: req.query.line as string, status: req.query.status as string };
  const data = await scheduleService.getAllSchedules(filters);
  res.json(data);
});

router.get("/dates", async (_req: Request, res: Response) => {
  const dates = await scheduleService.getUniqueDates();
  res.json(dates);
});

router.post("/import", async (req: Request, res: Response) => {
  const result = await scheduleService.importSchedules(req.body.items);
  res.status(201).json(result);
});

router.put("/:id", async (req: Request, res: Response) => {
  const sched = await scheduleService.updateSchedule(req.params.id, req.body);
  res.json(sched);
});

router.delete("/:id", async (req: Request, res: Response) => {
  await scheduleService.deleteSchedule(req.params.id);
  res.json({ success: true });
});

router.post("/convert/:date", async (req: Request, res: Response) => {
  await scheduleService.markDateConverted(req.params.date);
  res.json({ success: true });
});

router.get("/shift-summary/:date", async (req: Request, res: Response) => {
  const data = await scheduleService.getShiftSummary(req.params.date);
  res.json(data);
});

export default router;
