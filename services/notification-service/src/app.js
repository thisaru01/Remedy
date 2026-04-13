import express from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Notification service is running 🚀" });
});

// TODO: Add notification routes (email, SMS, in-app) here

export default app;
