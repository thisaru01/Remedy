import express from "express";
import {
  createSession,
  getSessionById,
  updateSessionStatus,
  getSessionsByPatient,
  getSessionsByDoctor,
} from "../controllers/sessionController.js";
import jwtAuthMiddleware from "../middleware/jwtAuthMiddleware.js";

const router = express.Router();

// Apply JWT authentication to all session routes
router.use(jwtAuthMiddleware);

// Create a session
router.post("/", createSession);

// Get a specific session
router.get("/:id", getSessionById);

// Update status (e.g. active / ended)
router.patch("/:id/status", updateSessionStatus);

// List sessions for a specific user
router.get("/patient/:patientId", getSessionsByPatient);
router.get("/doctor/:doctorId", getSessionsByDoctor);

export default router;
