import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./src/config/db.js";
import appointmentRoutes from "./src/routes/appointmentRoutes.js";
import internalAuthMiddleware from "./src/middleware/internalAuthMiddleware.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// MongoDB
connectDB();


// Test route
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "API is running 🚀" });
});

// Appointment routes (gateway-only)
app.use("/api/appointments", internalAuthMiddleware, appointmentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
