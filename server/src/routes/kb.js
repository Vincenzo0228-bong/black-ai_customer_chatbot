import express from "express";
import { z } from "zod";
import { searchKnowledgeBase } from "../services/kb.js";

export const kbRouter = express.Router();

kbRouter.post("/kb/search", async (req, res) => {
  const schema = z.object({ query: z.string().min(1).max(500) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const hits = await searchKnowledgeBase(parsed.data.query, { limit: 5 });
  res.json({ hits });
});


