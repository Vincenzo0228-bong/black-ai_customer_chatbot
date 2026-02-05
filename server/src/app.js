import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { healthRouter } from "./routes/health.js";
import { conversationsRouter } from "./routes/conversations.js";
import { kbRouter } from "./routes/kb.js";
import { analyticsRouter } from "./routes/analytics.js";

export function createApp() {
  const app = express();
  app.use(cors({ origin: config.clientOrigin, credentials: true }));
  app.use(express.json({ limit: "1mb" }));

  app.use("/api", healthRouter);
  app.use("/api", conversationsRouter);
  app.use("/api", kbRouter);
  app.use("/api", analyticsRouter);

  app.use((_req, res) => res.status(404).json({ error: "Not found" }));
  return app;
}


