import mongoose from "mongoose";

const AnalyticsEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["message_received", "reply_sent", "ai_fallback_used"],
      required: true,
      index: true
    },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", default: null, index: true },
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
    meta: { type: Object, default: {} }
  },
  { timestamps: true }
);

AnalyticsEventSchema.index({ createdAt: -1 });

export const AnalyticsEvent =
  mongoose.models.AnalyticsEvent || mongoose.model("AnalyticsEvent", AnalyticsEventSchema);


