import dotenv from "dotenv";
import { fileURLToPath } from "url";

import { loadConfig } from "./src/config/env.js";
import { createGatewayApp } from "./src/app.js";

dotenv.config();

// Keep a default export for testability and parity with other services.
const config = loadConfig();
const app = createGatewayApp(config);

export default app;

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
  app.listen(config.port, () => {
    console.log(`Gateway running on port ${config.port}`);
  });
}
