import { Router, Request, Response } from "express";
import * as auditService from "../services/audit.service.js";

const router = Router();

// Get audit logs
router.get("/", async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const moduleFilter = req.query.module as string | undefined;
    
    const logs = await auditService.getAuditLogs(limit, moduleFilter);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mengambil audit log" });
  }
});

// Explicit endpoint for frontend to log activities
router.post("/log", async (req: Request, res: Response) => {
  try {
    const { user, module, action, details } = req.body;
    
    if (!action) {
      return res.status(400).json({ success: false, message: "Action required" });
    }
    
    const userName = user || "Sistem / Anonymous";
    const moduleName = module || "GENERAL";
    
    await auditService.logActivity(userName, moduleName, action, details ? JSON.stringify(details) : undefined);
    
    res.json({ success: true, message: "Aktivitas dicatat" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mencatat log" });
  }
});

export default router;
