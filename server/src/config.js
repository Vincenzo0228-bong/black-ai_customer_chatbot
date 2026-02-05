import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "8080", 10),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  mongodbUri: process.env.MONGODB_URI || "",
  aiProvider: (process.env.AI_PROVIDER || "ollama").toLowerCase(), // ollama | openai | openai_compat
  aiApiKey: process.env.OPENAI_API_KEY || "",
  aiBaseUrl: process.env.OPENAI_BASE_URL || "", // used for openai_compat
  aiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  ollamaModel: process.env.OLLAMA_MODEL || "llama3.1",
  contextMaxMessages: parseInt(process.env.CONTEXT_MAX_MESSAGES || "20", 10),
};


