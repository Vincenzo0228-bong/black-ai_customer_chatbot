import http from "http";
import { createApp } from "./app.js";
import { config } from "./config.js";
import { connectDb } from "./db.js";
import { attachSocket } from "./socket.js";

async function main() {
  await connectDb();

  const app = createApp();
  const server = http.createServer(app);
  attachSocket(server, { corsOrigin: config.clientOrigin });

  server.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});


