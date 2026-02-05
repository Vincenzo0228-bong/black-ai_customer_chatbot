import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    title: { type: String, default: "New conversation" },
    userId: { type: String, default: "anonymous" },
    channel: { type: String, default: "web" },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    lastMessageAt: { type: Date, default: Date.now },
    contextSummary: { type: String, default: "" }
  },
  { timestamps: true }
);

ConversationSchema.index({ createdAt: -1 });

export const Conversation =
  mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);


