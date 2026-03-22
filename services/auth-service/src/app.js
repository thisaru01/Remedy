import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "API is running" });
});

// Routes
app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
