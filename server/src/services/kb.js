import { KnowledgeArticle } from "../models/KnowledgeArticle.js";

function scoreFromTextScore(textScore) {
  // Mongo textScore is unbounded; map to a soft [0..1] confidence
  if (typeof textScore !== "number") return 0;
  return Math.max(0, Math.min(1, textScore / 10));
}

export async function searchKnowledgeBase(query, { limit = 3 } = {}) {
  const q = (query || "").trim();
  if (!q) return [];

  const docs = await KnowledgeArticle.find(
    { $text: { $search: q } },
    { score: { $meta: "textScore" }, title: 1, body: 1, tags: 1 }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .lean();

  return docs.map((d) => ({
    id: String(d._id),
    title: d.title,
    body: d.body,
    tags: d.tags || [],
    confidence: scoreFromTextScore(d.score),
  }));
}

export function buildKbAnswer(hits) {
  if (!hits?.length) return null;
  const best = hits[0];
  const answer = `${best.title}\n\n${best.body}`.trim();
  return { answer, best };
}


