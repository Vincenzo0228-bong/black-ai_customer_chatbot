// Simple in-memory FIFO queue per key (conversationId).
// Guarantees ordering and 1-at-a-time processing per key.

const queues = new Map(); // key -> { items: [], running: false }

export function enqueue(key, task) {
  if (!queues.has(key)) queues.set(key, { items: [], running: false });
  const q = queues.get(key);
  q.items.push(task);
  drain(key).catch(() => {});
}

async function drain(key) {
  const q = queues.get(key);
  if (!q || q.running) return;
  q.running = true;
  try {
    while (q.items.length) {
      const t = q.items.shift();
      // eslint-disable-next-line no-await-in-loop
      await t();
    }
  } finally {
    q.running = false;
    if (q.items.length === 0) {
      // tiny cleanup to avoid unbounded memory growth
      queues.delete(key);
    }
  }
}


