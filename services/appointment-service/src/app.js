import express from "express";
import cors from "cors";
import morgan from "morgan";

import appointmentRoutes from "./routes/appointmentRoutes.js";
import internalAuthMiddleware from "./middleware/internalAuthMiddleware.js";

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
	res.status(200).json({ message: "API is running 🚀" });
});

// Routes (gateway-only)
app.use("/api/appointments", internalAuthMiddleware, appointmentRoutes);

export default app;
