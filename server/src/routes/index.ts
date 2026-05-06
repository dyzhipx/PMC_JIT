import { Router } from "express";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";
import authRoutes from "./auth.routes.js";
import masterRoutes from "./master.routes.js";
import scheduleRoutes from "./schedule.routes.js";
import materialRoutes from "./material.routes.js";
import warehouseRoutes from "./warehouse.routes.js";
import deliveryRoutes from "./delivery.routes.js";
import transitRoutes from "./transit.routes.js";
import productionRoutes from "./production.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import manualSpbRoutes from "./manual-spb.routes.js";
import bppRoutes from "./bpp.routes.js";
import opnameRoutes from "./opname.routes.js";
import anomalyRoutes from "./anomaly.routes.js";
import auditRoutes from "./audit.routes.js";

const router = Router();

// ── Public: Better Auth handles its own authentication ──
router.use("/auth", authRoutes);

// ── Protected: Require authenticated session for all API routes ──
router.use("/dashboard", requireAuth, dashboardRoutes);
router.use("/materials", requireAuth, materialRoutes);
router.use("/master", requireAuth, masterRoutes);
router.use("/schedule", requireAuth, scheduleRoutes);
router.use("/warehouse", requireAuth, warehouseRoutes);
router.use("/delivery", requireAuth, deliveryRoutes);
router.use("/transit", requireAuth, transitRoutes);
router.use("/production", requireAuth, productionRoutes);
router.use("/manual-spb", requireAuth, manualSpbRoutes);
router.use("/bpp", requireAuth, bppRoutes);
router.use("/opname", requireAuth, opnameRoutes);
router.use("/anomaly", requireAuth, anomalyRoutes);
router.use("/audit", requireAuth, auditRoutes);

export default router;
