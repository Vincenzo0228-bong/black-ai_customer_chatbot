import express from "express";

export const healthRouter = express.Router();

healthRouter.get("/health", (_req, res) => {
  res.json({ ok: true });
});


