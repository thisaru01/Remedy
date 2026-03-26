import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { isJaasEnabled, validateJaasConfig } from "./src/config/jaas.js";

// Load environment variables (.env file)
dotenv.config();

// Validate JaaS setup only when JaaS mode is in use.
if (isJaasEnabled()) {
  validateJaasConfig();
  console.log("JaaS configuration validated");
}

// Connect to MongoDB Database
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
