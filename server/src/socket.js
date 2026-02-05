import { Server } from "socket.io";
import { enqueue } from "./services/queue.js";
import { ensureConversation, processUserMessage } from "./services/chatProcessor.js";

export function attachSocket(server, { corsOrigin }) {
  const io = new Server(server, {
    cors: { origin: corsOrigin, methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    socket.on("conversation:create", async (payload, cb) => {
      try {
        const convo = await ensureConversation({
          conversationId: null,
          title: payload?.title,
          userId: payload?.userId,
        });
        socket.join(String(convo._id));
        cb?.({ ok: true, conversationId: String(convo._id) });
      } catch (e) {
        cb?.({ ok: false, error: e?.message || "Failed to create conversation" });
      }
    });

    socket.on("conversation:join", (payload, cb) => {
      const id = payload?.conversationId;
      if (!id) return cb?.({ ok: false, error: "conversationId required" });
      socket.join(String(id));
      cb?.({ ok: true });
    });

    socket.on("chat:message", (payload, cb) => {
      const conversationId = payload?.conversationId;
      const content = (payload?.content || "").trim();
      if (!conversationId || !content) return cb?.({ ok: false, error: "Invalid payload" });

      enqueue(String(conversationId), async () => {
        try {
          const result = await processUserMessage({ conversationId, content });
          io.to(String(conversationId)).emit("chat:message", result.userMessage);
          io.to(String(conversationId)).emit("chat:message", result.assistantMessage);
          cb?.({ ok: true });
        } catch (e) {
          cb?.({ ok: false, error: e?.message || "Failed to process message" });
        }
      });
    });
  });

  return io;
}


