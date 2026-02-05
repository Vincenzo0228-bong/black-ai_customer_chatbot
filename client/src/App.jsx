import React, { useState } from "react";
import { Layout } from "./components/Layout.jsx";
import { ChatPage } from "./pages/ChatPage.jsx";
import { AnalyticsPage } from "./pages/AnalyticsPage.jsx";

export default function App() {
  const [route, setRoute] = useState("chat");

  return (
    <Layout active={route} onNavigate={setRoute}>
      {route === "analytics" ? <AnalyticsPage /> : <ChatPage />}
    </Layout>
  );
}
