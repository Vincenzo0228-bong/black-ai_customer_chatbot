import OpenAI from "openai";
import { config } from "../config.js";

let client = null;

function getClient() {
  if (!config.openaiApiKey) return null;
  if (!client) client = new OpenAI({ apiKey: config.openaiApiKey });
  return client;
}

export async function generateAiReply({ systemPrompt, messages }) {
  const c = getClient();
  if (!c) {
    return {
      content: "",
      model: null,
    };
  }

  const resp = await c.chat.completions.create({
    model: config.openaiModel,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    temperature: 0.2,
  });

  const content = resp.choices?.[0]?.message?.content?.trim() || "";
  return { content, model: resp.model || config.openaiModel };
}


