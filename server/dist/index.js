import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import apiRoutes from "./routes/index.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { ensureCounters } from "./services/warehouse.service.js";
import { createServer } from "http";
import { initSocketServer } from "./config/socket.js";
const app = express();
const httpServer = createServer(app);
// Initialize Socket.io
initSocketServer(httpServer);
// ── Middleware ──
// Support multiple origins split by comma
const origins = env.CORS_ORIGIN.includes(",") ? env.CORS_ORIGIN.split(",") : env.CORS_ORIGIN;
app.use(cors({ origin: origins, credentials: true }));
app.use(express.json({ limit: "10mb" }));
// Request Logger
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'None'}`);
    next();
});
// ── Health Check ──
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// ── API Routes ──
app.use("/api", apiRoutes);
// ── Production: Serve Frontend Static Files ──
// In production, Express serves the built frontend (dist/) so both API and UI
// run on the same origin — no Vite proxy needed.
if (env.NODE_ENV === "production") {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const distPath = path.resolve(__dirname, "../../dist");
    app.use(express.static(distPath));
    // SPA fallback: any non-API route returns index.html
    app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });
}
// ── Error Handler ──
app.use(errorHandler);
// ── Start Server ──
async function start() {
    try {
        // Ensure system counters exist
        await ensureCounters();
        console.log("✅ System counters initialized");
        httpServer.listen(env.PORT, () => {
            console.log(`
╔═══════════════════════════════════════════════╗
║  🏭 PMC Backend Server                       ║
║  Running on: http://localhost:${env.PORT}          ║
║  Environment: ${env.NODE_ENV.padEnd(30)}║
║  Database: SQL Server (PrismaORM)           ║
║  Auth: Better Auth (Prisma Adapter)           ║
╚═══════════════════════════════════════════════╝
      `);
        });
    }
    catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
    }
}
start();
