import express from "express";
import cors from "cors";
import morgan from "morgan";

import aiRoutes from "./routes/aiRoutes.js";
import internalAuthMiddleware from "./middleware/internalAuthMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "AI service is running 🚀" });
});

// Gateway-only route for AI symptom checker
app.use("/api/ai/symptom-check", internalAuthMiddleware, aiRoutes);

export default app;
