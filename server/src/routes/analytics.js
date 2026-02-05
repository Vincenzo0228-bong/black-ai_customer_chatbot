import express from "express";
import { AnalyticsEvent } from "../models/AnalyticsEvent.js";
import { Message } from "../models/Message.js";

export const analyticsRouter = express.Router();

analyticsRouter.get("/analytics/overview", async (_req, res) => {
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const [events14d, aiFallback14d, messagesTotal] = await Promise.all([
    AnalyticsEvent.countDocuments({ createdAt: { $gte: since } }),
    AnalyticsEvent.countDocuments({ type: "ai_fallback_used", createdAt: { $gte: since } }),
    Message.countDocuments({}),
  ]);

  const avgLatencyAgg = await Message.aggregate([
    { $match: { role: "assistant" } },
    { $group: { _id: null, avgLatencyMs: { $avg: "$meta.latencyMs" } } },
  ]);

  res.json({
    windowDays: 14,
    events14d,
    aiFallback14d,
    messagesTotal,
    avgAssistantLatencyMs: Math.round(avgLatencyAgg?.[0]?.avgLatencyMs || 0),
  });
});

analyticsRouter.get("/analytics/series", async (req, res) => {
  const days = Math.max(1, Math.min(90, parseInt(req.query.days || "14", 10)));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const series = await AnalyticsEvent.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          type: "$type",
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.day": 1 } },
  ]);

  res.json({ days, series });
});


