import mongoose from "mongoose";

const KnowledgeArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    tags: { type: [String], default: [] },
    body: { type: String, required: true },
    source: { type: String, default: "internal" }
  },
  { timestamps: true }
);

KnowledgeArticleSchema.index({ title: "text", body: "text", tags: "text" });

export const KnowledgeArticle =
  mongoose.models.KnowledgeArticle || mongoose.model("KnowledgeArticle", KnowledgeArticleSchema);


