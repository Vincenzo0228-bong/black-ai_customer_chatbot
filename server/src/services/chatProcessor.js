import { config } from "../config.js";
import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { AnalyticsEvent } from "../models/AnalyticsEvent.js";
import { searchKnowledgeBase, buildKbAnswer } from "./kb.js";
import { generateAiReply, isAiEnabled } from "./ai.js";
import { nowMs, msSince } from "../utils/time.js";

const DEFAULT_SYSTEM_PROMPT =
  "You are a helpful customer support assistant. Be concise, ask a clarifying question if needed, and never fabricate account-specific details. If you are unsure, suggest contacting support.";

function isGreeting(text) {
  const t = (text || "").trim().toLowerCase();
  return ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"].includes(t);
}

function localFallbackReply(userText) {
  if (isGreeting(userText)) {
    return "Hi! How can I help you today? For example: password reset, refund policy, or order tracking.";
  }
  return (
    "Thanks—can you share a bit more detail so I can help? " +
    "For example: what product/feature, what you expected, and any error message you see."
  );
}

export async function ensureConversation({ conversationId, title, userId }) {
  if (conversationId) {
    const existing = await Conversation.findById(conversationId);
    if (existing) return existing;
  }
  const convo = await Conversation.create({
    title: title || "New conversation",
    userId: userId || "anonymous",
    lastMessageAt: new Date(),
  });
  return convo;
}

export async function processUserMessage({ conversationId, content }) {
  const start = nowMs();
  const convo = await Conversation.findById(conversationId);
  if (!convo) throw new Error("Conversation not found.");

  const userMsg = await Message.create({
    conversationId: convo._id,
    role: "user",
    content,
    meta: { source: "system" },
  });

  await AnalyticsEvent.create({
    type: "message_received",
    conversationId: convo._id,
    messageId: userMsg._id,
  });

  // Context window: last N messages (excluding the one we just created is fine, but we include it for AI).
  const recent = await Message.find({ conversationId: convo._id })
    .sort({ createdAt: -1 })
    .limit(config.contextMaxMessages)
    .lean();
  const contextMessages = recent
    .reverse()
    .map((m) => ({ role: m.role, content: m.content }));

  // 1) KB-first retrieval
  const hits = await searchKnowledgeBase(content, { limit: 3 });
  const kb = buildKbAnswer(hits);

  let replyText = "";
  let source = "fallback";
  let confidence = 0;
  let kbArticleId = null;
  let usedAi = false;

  if (kb && kb.best.confidence >= 0.45) {
    replyText = kb.answer;
    source = "kb";
    confidence = kb.best.confidence;
    kbArticleId = kb.best.id;
  } else {
    // 2) AI fallback (only if configured); otherwise use a local fallback that doesn't mention config
    if (isAiEnabled()) {
      usedAi = true;
      const ai = await generateAiReply({
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
        messages: contextMessages,
      });
      replyText = ai.content || localFallbackReply(content);
      source = "ai";
      confidence = 0.5;
    } else {
      usedAi = false;
      replyText = localFallbackReply(content);
      source = "fallback";
      confidence = 0.0;
    }
  }

  const latencyMs = msSince(start);
  const assistantMsg = await Message.create({
    conversationId: convo._id,
    role: "assistant",
    content: replyText,
    meta: {
      source,
      confidence,
      kbArticleId: kbArticleId || null,
      latencyMs,
    },
  });

  await Conversation.updateOne(
    { _id: convo._id },
    { $set: { lastMessageAt: new Date() } }
  );

  await AnalyticsEvent.create({
    type: "reply_sent",
    conversationId: convo._id,
    messageId: assistantMsg._id,
    meta: { source, latencyMs },
  });

  if (usedAi) {
    await AnalyticsEvent.create({
      type: "ai_fallback_used",
      conversationId: convo._id,
      messageId: assistantMsg._id,
      meta: { reason: "kb_low_confidence", kbTopConfidence: kb?.best?.confidence ?? 0 },
    });
  }

  return {
    conversationId: String(convo._id),
    userMessage: toPublicMessage(userMsg),
    assistantMessage: toPublicMessage(assistantMsg),
  };
}

export function toPublicMessage(m) {
  return {
    id: String(m._id),
    conversationId: String(m.conversationId),
    role: m.role,
    content: m.content,
    createdAt: m.createdAt,
    meta: m.meta || {},
  };
}


