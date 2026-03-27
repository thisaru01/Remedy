import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import { validateJaasConfig } from "./src/config/jaas.js";

// Load environment variables (.env file)
dotenv.config();

const { default: app } = await import("./src/app.js");

// Telemedicine runs in JaaS-only mode; fail fast if configuration is incomplete.
validateJaasConfig();
console.log("JaaS-only configuration validated");

// Connect to MongoDB Database
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
