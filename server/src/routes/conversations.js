import express from "express";
import { z } from "zod";
import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { ensureConversation, toPublicMessage } from "../services/chatProcessor.js";

export const conversationsRouter = express.Router();

conversationsRouter.get("/conversations", async (req, res) => {
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || "20", 10)));
  const convos = await Conversation.find({})
    .sort({ lastMessageAt: -1 })
    .limit(limit)
    .lean();
  res.json(
    convos.map((c) => ({
      id: String(c._id),
      title: c.title,
      userId: c.userId,
      status: c.status,
      lastMessageAt: c.lastMessageAt,
      createdAt: c.createdAt,
    }))
  );
});

conversationsRouter.post("/conversations", async (req, res) => {
  const schema = z.object({
    title: z.string().min(1).max(120).optional(),
    userId: z.string().min(1).max(120).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const convo = await ensureConversation({
    conversationId: null,
    title: parsed.data.title,
    userId: parsed.data.userId,
  });
  res.status(201).json({ id: String(convo._id) });
});

conversationsRouter.get("/conversations/:id/messages", async (req, res) => {
  const { id } = req.params;
  const limit = Math.max(1, Math.min(200, parseInt(req.query.limit || "50", 10)));
  const msgs = await Message.find({ conversationId: id }).sort({ createdAt: 1 }).limit(limit);
  res.json(msgs.map(toPublicMessage));
});


