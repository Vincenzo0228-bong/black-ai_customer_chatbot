## AI-Powered Customer Support Chatbot (React + Node + Mongo + Socket.io + OpenAI)

### What you get
- **Chat UI** (React/Vite): realtime messaging over Socket.io, conversation history, agent/assistant messages.
- **Backend** (Node/Express): message queue (per-conversation), **context tracking**, knowledge-base retrieval + **AI fallback** (OpenAI), conversation logs in MongoDB.
- **Analytics**: basic dashboard + API aggregations (volume, response time, fallback rate, top intents/labels).

---

### Prerequisites
- Node.js 18+ (recommended 20+)
- MongoDB (local or Atlas)
- An OpenAI API key (optional; app still runs in KB-only mode)

---

### Setup
1) Install dependencies (from repo root):

```bash
npm install
```

2) Create env file for server:

```bash
cp server/env.example server/.env
```

3) Update `server/.env`:
- `MONGODB_URI` (required)
- `OPENAI_API_KEY` (optional; enables AI fallback)

4) (Optional) Seed sample knowledge base articles:

```bash
npm run seed:kb
```

---

### Run (dev)
From repo root:

```bash
npm run dev
```

- Client: `http://localhost:5173`
- Server: `http://localhost:8080`

---

### Architecture (high level)
- **Socket.io**: realtime chat. Client emits `chat:message` → server enqueues message → processes sequentially per conversation.
- **Message queue**: in-memory FIFO per conversation (1-at-a-time) to preserve ordering and context.
- **Context tracking**: last N messages (configurable) + optional rolling summary field.
- **AI fallback**:
  - Try knowledge-base retrieval first (Mongo text search).
  - If low confidence/no hits → call OpenAI.
  - If OpenAI key missing → returns a safe fallback response.

---

### Useful endpoints
- `GET /api/health`
- `GET /api/conversations?limit=20`
- `GET /api/conversations/:id/messages`
- `POST /api/kb/search` `{ query }`
- `GET /api/analytics/overview`
- `GET /api/analytics/series?days=14`


