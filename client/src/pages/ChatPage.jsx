import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import { getSocket } from "../lib/socket";

export function ChatPage() {
  const socket = useMemo(() => getSocket(), []);
  const [conversationId, setConversationId] = useState("");
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("idle"); // idle | connecting | ready
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    apiGet("/api/conversations?limit=20")
      .then((data) => mounted && setConversations(data))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const onConnect = () => setStatus("ready");
    const onDisconnect = () => setStatus("connecting");
    const onMsg = (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };
    setStatus(socket.connected ? "ready" : "connecting");
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat:message", onMsg);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chat:message", onMsg);
    };
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function createConversation() {
    setError("");
    const res = await apiPost("/api/conversations", { title: "Web chat", userId: "anonymous" });
    const id = res.id;
    setConversationId(id);
    setMessages([]);
    await loadConversation(id);
    setConversations((prev) => [{ id, title: "Web chat", userId: "anonymous" }, ...prev]);
  }

  async function loadConversation(id) {
    setError("");
    setConversationId(id);
    socket.emit("conversation:join", { conversationId: id }, () => {});
    const msgs = await apiGet(`/api/conversations/${id}/messages?limit=200`);
    setMessages(msgs);
  }

  function sendMessage() {
    setError("");
    const content = draft.trim();
    if (!content) return;
    if (!conversationId) {
      setError("Create or select a conversation first.");
      return;
    }
    setDraft("");
    socket.emit("chat:message", { conversationId, content }, (ack) => {
      if (!ack?.ok) setError(ack?.error || "Failed to send.");
    });
  }

  return (
    <div style={styles.grid}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarTop}>
          <div style={{ fontWeight: 800 }}>Conversations</div>
          <button style={styles.primaryBtn} onClick={createConversation}>
            New
          </button>
        </div>
        <div style={styles.list}>
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => loadConversation(c.id)}
              style={{
                ...styles.listItem,
                ...(conversationId === c.id ? styles.listItemActive : {}),
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13 }}>{c.title || "Conversation"}</div>
              <div style={{ opacity: 0.7, fontSize: 12 }}>{c.userId || "anonymous"}</div>
            </button>
          ))}
          {!conversations.length && (
            <div style={{ opacity: 0.75, fontSize: 13, padding: 10 }}>
              No conversations yet. Click <b>New</b>.
            </div>
          )}
        </div>
        <div style={styles.sidebarBottom}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            Socket: <b>{status}</b>
          </div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            Conversation: <b>{conversationId ? conversationId.slice(-6) : "—"}</b>
          </div>
        </div>
      </aside>

      <section style={styles.chatPanel}>
        <div style={styles.chatHeader}>
          <div style={{ fontWeight: 800 }}>Chat</div>
          <div style={{ opacity: 0.75, fontSize: 13 }}>
            KB-first, AI fallback, queued per conversation
          </div>
        </div>

        <div style={styles.chatBody}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                ...styles.msgRow,
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  ...styles.msgBubble,
                  ...(m.role === "user" ? styles.userBubble : styles.assistantBubble),
                }}
              >
                <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
                <div style={styles.meta}>
                  <span style={{ textTransform: "capitalize" }}>{m.role}</span>
                  {m.meta?.source ? <span> · {m.meta.source}</span> : null}
                  {typeof m.meta?.latencyMs === "number" && m.role === "assistant" ? (
                    <span> · {m.meta.latencyMs}ms</span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div style={styles.chatComposer}>
          {error ? <div style={styles.error}>{error}</div> : null}
          <div style={styles.composerRow}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask a question (e.g., 'How do I reset my password?')"
              style={styles.input}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button style={styles.sendBtn} onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: 16,
  },
  sidebar: {
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    minHeight: "70vh",
  },
  sidebarTop: {
    padding: 14,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  list: { padding: 10, display: "flex", flexDirection: "column", gap: 8, flex: 1 },
  listItem: {
    textAlign: "left",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.12)",
    color: "#eaf0ff",
    padding: 12,
    borderRadius: 14,
    cursor: "pointer",
  },
  listItemActive: {
    borderColor: "rgba(124,92,255,0.8)",
    background: "rgba(124,92,255,0.12)",
  },
  sidebarBottom: {
    padding: 12,
    borderTop: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    justifyContent: "space-between",
  },
  primaryBtn: {
    border: "1px solid rgba(51,209,255,0.45)",
    background: "rgba(51,209,255,0.12)",
    color: "#eaf0ff",
    padding: "8px 10px",
    borderRadius: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  chatPanel: {
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    minHeight: "70vh",
  },
  chatHeader: {
    padding: 14,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  chatBody: { padding: 14, overflow: "auto", flex: 1 },
  msgRow: { display: "flex", marginBottom: 10 },
  msgBubble: {
    maxWidth: "78%",
    padding: "12px 12px 10px 12px",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.14)",
  },
  userBubble: {
    background: "rgba(124,92,255,0.14)",
    borderColor: "rgba(124,92,255,0.35)",
  },
  assistantBubble: {
    background: "rgba(51,209,255,0.10)",
    borderColor: "rgba(51,209,255,0.28)",
  },
  meta: { marginTop: 8, fontSize: 12, opacity: 0.75 },
  chatComposer: {
    padding: 14,
    borderTop: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(0,0,0,0.10)",
  },
  composerRow: { display: "flex", gap: 10 },
  input: {
    flex: 1,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.18)",
    color: "#eaf0ff",
    padding: "12px 12px",
    outline: "none",
  },
  sendBtn: {
    borderRadius: 14,
    border: "1px solid rgba(120,255,214,0.45)",
    background: "rgba(120,255,214,0.12)",
    color: "#eaf0ff",
    padding: "12px 14px",
    fontWeight: 800,
    cursor: "pointer",
  },
  error: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 14,
    border: "1px solid rgba(255,120,120,0.4)",
    background: "rgba(255,120,120,0.10)",
    color: "#ffecec",
    fontSize: 13,
  },
};


