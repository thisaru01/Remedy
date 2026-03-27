import express from "express";
import {
  getAllSessions,
  createSession,
  getSessionById,
  getSessionByAppointmentId,
  getSessionJoinDetails,
  updateSessionStatus,
  getSessionsByPatient,
  getSessionsByDoctor,
} from "../controllers/sessionController.js";
import internalAuthMiddleware from "../middleware/internalAuthMiddleware.js";

const router = express.Router();

// Apply internal gateway authentication to all session routes
router.use(internalAuthMiddleware);

// Create a session
router.post("/", createSession);

// Global session list (admin)
router.get("/", getAllSessions);

// List sessions for a specific user
router.get("/patient/:patientId", getSessionsByPatient);
router.get("/doctor/:doctorId", getSessionsByDoctor);
router.get("/appointment/:appointmentId", getSessionByAppointmentId);

// Get secure join details for a session
router.get("/:id/join", getSessionJoinDetails);

// Get a specific session
router.get("/:id", getSessionById);

// Update status (e.g. active / ended)
router.patch("/:id/status", updateSessionStatus);

export default router;
