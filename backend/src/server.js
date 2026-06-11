import express from "express";
import fs from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
import { config } from "./config.js";
import { readinessCheck, pool } from "./db.js";
import { logger } from "./logger.js";
import { requireAuth } from "./middleware/auth.js";
import { idempotency } from "./middleware/idempotency.js";
import { requestContext } from "./middleware/requestContext.js";
import { authRouter } from "./routes/auth.js";
import { profileRouter } from "./routes/profile.js";
import { riderRouter } from "./routes/rider.js";
import { ordersRouter } from "./routes/orders.js";
import { earningsRouter } from "./routes/earnings.js";
import { documentsRouter } from "./routes/documents.js";
import { supportRouter } from "./routes/support.js";
import { adminRouter } from "./routes/admin.js";
import { registerLocationSocket } from "./services/locationSocket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const bundledAdminPanelDir = path.resolve(__dirname, "../admin_panel");
const repoAdminPanelDir = path.resolve(__dirname, "../../admin_panel");
const adminPanelDir = fs.existsSync(bundledAdminPanelDir) ? bundledAdminPanelDir : repoAdminPanelDir;
const bundledSchemaPath = path.resolve(__dirname, "../database/schema.sql");
const repoSchemaPath = path.resolve(__dirname, "../../database/schema.sql");
const schemaPath = fs.existsSync(bundledSchemaPath) ? bundledSchemaPath : repoSchemaPath;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: config.allowedOrigins.length > 0 ? config.allowedOrigins : true },
});

if (config.trustProxy) app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: config.allowedOrigins.length > 0 ? config.allowedOrigins : true }));
app.use(requestContext);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev", {
  stream: { write: (message) => logger.info("http_request", { message: message.trim() }) },
}));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.get("/health", (_req, res) => res.json({ ok: true, service: "quick-commerce-rider-api" }));
app.get("/ready", async (_req, res) => {
  try {
    const database = await readinessCheck();
    res.status(database ? 200 : 503).json({ ok: database, database });
  } catch (error) {
    res.status(503).json({ ok: false, database: false, error: "READINESS_FAILED" });
  }
});

app.get("/admin", (_req, res) => {
  res.sendFile(path.join(adminPanelDir, "index.html"));
});
app.get("/admin/", (_req, res) => {
  res.sendFile(path.join(adminPanelDir, "index.html"));
});
app.get("/admin/config.js", (_req, res) => {
  res.type("application/javascript").set("Cache-Control", "no-store").send("window.EVSPEARE_CONFIG = {};");
});
app.use("/admin", express.static(adminPanelDir, { index: false }));

app.use(authRouter);
app.use("/api/admin", (req, _res, next) => {
  req.auth = { sub: null, admin: true };
  return next();
}, idempotency(), adminRouter);
app.use("/admin", (req, res, next) => {
  const adminKey = req.headers["x-admin-key"];
  if (config.adminApiKey && adminKey === config.adminApiKey) {
    req.auth = { sub: null, admin: true };
    return next();
  }
  return requireAuth(req, res, next);
}, idempotency(), adminRouter);
app.use(requireAuth);
app.use(idempotency());
app.use(profileRouter);
app.use(riderRouter);
app.use(ordersRouter);
app.use(earningsRouter);
app.use(documentsRouter);
app.use(supportRouter);

app.use((err, req, res, _next) => {
  logger.error("unhandled_request_error", {
    requestId: req.requestId,
    error: err.message,
    stack: config.nodeEnv === "production" ? undefined : err.stack,
  });
  res.status(500).json({ error: "INTERNAL_SERVER_ERROR", requestId: req.requestId });
});

registerLocationSocket(io);

async function applyDatabaseSchema() {
  if (!config.databaseUrl || !config.autoMigrate) return;
  if (!fs.existsSync(schemaPath)) {
    logger.info("database_schema_skipped", { reason: "schema file not found", path: schemaPath });
    return;
  }
  const schema = fs.readFileSync(schemaPath, "utf8");
  await pool.query(schema);
  logger.info("database_schema_applied");
}

await applyDatabaseSchema();

const listener = server.listen(config.port, () => {
  logger.info("server_started", { port: config.port, nodeEnv: config.nodeEnv });
});

async function shutdown(signal) {
  logger.info("shutdown_started", { signal });
  listener.close(async () => {
    await pool.end();
    logger.info("shutdown_complete");
    process.exit(0);
  });
  setTimeout(() => {
    logger.error("shutdown_forced", { signal });
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
