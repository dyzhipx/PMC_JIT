import { Router } from "express";
import * as scheduleService from "../services/schedule.service.js";
const router = Router();
router.get("/", async (req, res) => {
    const filters = { date: req.query.date, line: req.query.line, status: req.query.status };
    const data = await scheduleService.getAllSchedules(filters);
    res.json(data);
});
router.get("/dates", async (_req, res) => {
    const dates = await scheduleService.getUniqueDates();
    res.json(dates);
});
router.post("/import", async (req, res) => {
    const result = await scheduleService.importSchedules(req.body.items);
    res.status(201).json(result);
});
router.put("/:id", async (req, res) => {
    const sched = await scheduleService.updateSchedule(req.params.id, req.body);
    res.json(sched);
});
router.delete("/:id", async (req, res) => {
    await scheduleService.deleteSchedule(req.params.id);
    res.json({ success: true });
});
router.post("/convert/:date", async (req, res) => {
    await scheduleService.markDateConverted(req.params.date);
    res.json({ success: true });
});
router.get("/shift-summary/:date", async (req, res) => {
    const data = await scheduleService.getShiftSummary(req.params.date);
    res.json(data);
});
export default router;
