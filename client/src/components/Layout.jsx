import React from "react";

export function Layout({ active, onNavigate, children }) {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brand}>
          <div style={styles.logo}>
            <img
              src="/logo.png"
              alt="Logo"
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }}
            />
          </div>
          <div>
            <div style={styles.title}>Support Chatbot</div>
            <div style={styles.subtitle}>React + Socket.io + Mongo + AI fallback</div>
          </div>
        </div>
        <nav style={styles.nav}>
          <button
            onClick={() => onNavigate("chat")}
            style={{ ...styles.tab, ...(active === "chat" ? styles.tabActive : {}) }}
          >
            Chat
          </button>
          <button
            onClick={() => onNavigate("analytics")}
            style={{ ...styles.tab, ...(active === "analytics" ? styles.tabActive : {}) }}
          >
            Analytics
          </button>
        </nav>
      </header>
      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(1200px 600px at 20% 0%, #1b2a55 0%, #0b1220 40%, #070b12 100%)",
    color: "#eaf0ff",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
    background: "rgba(6,10,18,0.5)",
  },
  brand: { display: "flex", gap: 12, alignItems: "center" },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 12,
    background:
      "linear-gradient(135deg, rgba(124,92,255,1) 0%, rgba(51,209,255,1) 70%, rgba(120,255,214,1) 100%)",
    boxShadow: "0 12px 30px rgba(124,92,255,0.28)",
  },
  title: { fontWeight: 700, letterSpacing: 0.2 },
  subtitle: { fontSize: 12, opacity: 0.75 },
  nav: { display: "flex", gap: 8 },
  tab: {
    appearance: "none",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#eaf0ff",
    padding: "10px 12px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 600,
  },
  tabActive: {
    borderColor: "rgba(51,209,255,0.6)",
    background: "rgba(51,209,255,0.12)",
  },
  main: { padding: 20, maxWidth: 1100, margin: "0 auto" },
};


