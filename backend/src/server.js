import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
import { config } from "./config.js";
import { requireAuth } from "./middleware/auth.js";
import { authRouter } from "./routes/auth.js";
import { profileRouter } from "./routes/profile.js";
import { riderRouter } from "./routes/rider.js";
import { ordersRouter } from "./routes/orders.js";
import { earningsRouter } from "./routes/earnings.js";
import { documentsRouter } from "./routes/documents.js";
import { supportRouter } from "./routes/support.js";
import { adminRouter } from "./routes/admin.js";
import { registerLocationSocket } from "./services/locationSocket.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.get("/health", (_req, res) => res.json({ ok: true, service: "quick-commerce-rider-api" }));
app.use(authRouter);
app.use(requireAuth, profileRouter);
app.use(requireAuth, riderRouter);
app.use(requireAuth, ordersRouter);
app.use(requireAuth, earningsRouter);
app.use(requireAuth, documentsRouter);
app.use(requireAuth, supportRouter);
app.use(requireAuth, adminRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
});

registerLocationSocket(io);

server.listen(config.port, () => {
  console.log(`Quick Commerce Rider API running on :${config.port}`);
});
