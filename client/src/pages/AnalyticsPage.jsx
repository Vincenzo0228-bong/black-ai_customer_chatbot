import React, { useEffect, useMemo, useState } from "react";
import { apiGet } from "../lib/api";

function Card({ title, value, subtitle }) {
  return (
    <div style={styles.card}>
      <div style={{ opacity: 0.75, fontSize: 12, fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>{value}</div>
      {subtitle ? <div style={{ opacity: 0.7, fontSize: 12, marginTop: 6 }}>{subtitle}</div> : null}
    </div>
  );
}

export function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [series, setSeries] = useState(null);
  const [error, setError] = useState("");
  const days = 14;

  useEffect(() => {
    let mounted = true;
    setError("");
    Promise.all([apiGet("/api/analytics/overview"), apiGet(`/api/analytics/series?days=${days}`)])
      .then(([o, s]) => {
        if (!mounted) return;
        setOverview(o);
        setSeries(s);
      })
      .catch((e) => mounted && setError(e?.message || "Failed to load analytics"));
    return () => {
      mounted = false;
    };
  }, []);

  const table = useMemo(() => {
    const rows = series?.series || [];
    const map = new Map(); // day -> { day, ...counts }
    for (const r of rows) {
      const day = r._id?.day;
      const type = r._id?.type;
      if (!day || !type) continue;
      if (!map.has(day)) map.set(day, { day, message_received: 0, reply_sent: 0, ai_fallback_used: 0 });
      map.get(day)[type] = r.count;
    }
    return Array.from(map.values()).sort((a, b) => a.day.localeCompare(b.day));
  }, [series]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={styles.headerRow}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Analytics</div>
          <div style={{ opacity: 0.75, fontSize: 13 }}>Last {days} days</div>
        </div>
      </div>

      {error ? <div style={styles.error}>{error}</div> : null}

      <div style={styles.cards}>
        <Card title="Total messages" value={overview?.messagesTotal ?? "—"} subtitle="All time" />
        <Card
          title="Events (14d)"
          value={overview?.events14d ?? "—"}
          subtitle="message_received + reply_sent + fallbacks"
        />
        <Card title="AI fallbacks (14d)" value={overview?.aiFallback14d ?? "—"} subtitle="KB low confidence" />
        <Card
          title="Avg assistant latency"
          value={overview?.avgAssistantLatencyMs != null ? `${overview.avgAssistantLatencyMs}ms` : "—"}
          subtitle="From stored meta.latencyMs"
        />
      </div>

      <div style={styles.panel}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Daily event series</div>
        <div style={{ overflow: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Day</th>
                <th style={styles.th}>Messages received</th>
                <th style={styles.th}>Replies sent</th>
                <th style={styles.th}>AI fallbacks</th>
              </tr>
            </thead>
            <tbody>
              {table.map((r) => (
                <tr key={r.day}>
                  <td style={styles.td}>{r.day}</td>
                  <td style={styles.td}>{r.message_received}</td>
                  <td style={styles.td}>{r.reply_sent}</td>
                  <td style={styles.td}>{r.ai_fallback_used}</td>
                </tr>
              ))}
              {!table.length ? (
                <tr>
                  <td style={styles.td} colSpan={4}>
                    No data yet. Send a few chat messages.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  headerRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
  },
  card: {
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    padding: 14,
  },
  panel: {
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    padding: 14,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },
  th: {
    textAlign: "left",
    padding: "10px 8px",
    borderBottom: "1px solid rgba(255,255,255,0.10)",
    opacity: 0.8,
    fontWeight: 800,
  },
  td: {
    padding: "10px 8px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    opacity: 0.92,
  },
  error: {
    padding: 10,
    borderRadius: 14,
    border: "1px solid rgba(255,120,120,0.4)",
    background: "rgba(255,120,120,0.10)",
    color: "#ffecec",
    fontSize: 13,
  },
};


