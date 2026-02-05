import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    meta: {
      source: { type: String, enum: ["kb", "ai", "fallback", "system"], default: "system" },
      confidence: { type: Number, default: 0 },
      kbArticleId: { type: mongoose.Schema.Types.ObjectId, ref: "KnowledgeArticle", default: null },
      latencyMs: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);


