import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./src/config/db.js";
import doctorProfileRoutes from "./src/routes/doctorProfileRoutes.js";
import doctorScheduleRoutes from "./src/routes/doctorScheduleRoutes.js";
import { startScheduleSlotResetJob } from "./src/services/scheduleSlotResetJob.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// MongoDB
connectDB();

// Routes
app.use("/api/doctor-profiles", doctorProfileRoutes);
app.use("/api/doctor-schedules", doctorScheduleRoutes);

// Test route
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "API is running 🚀" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Start background job that resets schedule slotCount to 6
  // when a new schedule day arrives.
  startScheduleSlotResetJob();
});
