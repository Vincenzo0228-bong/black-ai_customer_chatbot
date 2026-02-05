import OpenAI from "openai";
import { config } from "../config.js";

let openaiClient = null;

function getOpenAiClient() {
  if (!config.aiApiKey) return null;
  if (!openaiClient) {
    const opts = { apiKey: config.aiApiKey };
    if (config.aiProvider === "openai_compat" && config.aiBaseUrl) {
      opts.baseURL = config.aiBaseUrl;
    }
    openaiClient = new OpenAI(opts);
  }
  return openaiClient;
}

export function isAiEnabled() {
  if (config.aiProvider === "ollama") return true; // free/local if running
  if (config.aiProvider === "openai") return Boolean(config.aiApiKey);
  if (config.aiProvider === "openai_compat") return Boolean(config.aiApiKey && config.aiBaseUrl);
  return false;
}

export async function generateAiReply({ systemPrompt, messages }) {
  if (config.aiProvider === "ollama") {
    // Ollama chat API: http://localhost:11434/api/chat
    try {
      const res = await fetch(`${config.ollamaBaseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: config.ollamaModel,
          stream: false,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
          options: { temperature: 0.2 },
        }),
      });

      if (!res.ok) {
        // If Ollama isn't running / model missing / etc, caller will fall back.
        return { content: "", model: config.ollamaModel };
      }
      const data = await res.json();
      return { content: (data?.message?.content || "").trim(), model: config.ollamaModel };
    } catch {
      // Network error (common when Ollama isn't running). Never crash chat flow.
      return { content: "", model: config.ollamaModel };
    }
  }

  const c = getOpenAiClient();
  if (!c) return { content: "", model: null };

  const resp = await c.chat.completions.create({
    model: config.aiModel,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    temperature: 0.2,
  });

  const content = resp.choices?.[0]?.message?.content?.trim() || "";
  return { content, model: resp.model || config.aiModel };
}

