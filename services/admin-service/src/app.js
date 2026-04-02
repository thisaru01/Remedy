import express from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Admin health API is running 🚀" });
});

// Routes

export default app;
