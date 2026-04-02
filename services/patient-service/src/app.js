import express from "express";
import cors from "cors";
import morgan from "morgan";

import patientProfileRoutes from "./routes/patientProfileRoutes.js";
import patientReportRoutes from "./routes/patientReportRoutes.js";

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "API is running 🚀" });
});

// Routes
app.use("/api/patient-profiles", patientProfileRoutes);
app.use("/api/patient-reports", patientReportRoutes);

export default app;
