import express from "express";
import cors from "cors";
import morgan from "morgan";

import sessionRoutes from "./routes/sessionRoutes.js";

const app = express();

const getAllowedOrigins = () => {
  return (process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:5173,http://localhost:4173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();

    // Allow non-browser requests (e.g., Postman, service-to-service calls)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS policy: Origin not allowed"));
  },
};

// Core Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "API is running 🚀" });
});

// Routes
app.use("/api/sessions", sessionRoutes);

// Unknown route handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

export default app;