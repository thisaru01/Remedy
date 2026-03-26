import express from "express";
import {
  createSession,
  getSessionById,
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

// List sessions for a specific user
router.get("/patient/:patientId", getSessionsByPatient);
router.get("/doctor/:doctorId", getSessionsByDoctor);

// Get secure join details for a session
router.get("/:id/join", getSessionJoinDetails);

// Get a specific session
router.get("/:id", getSessionById);

// Update status (e.g. active / ended)
router.patch("/:id/status", updateSessionStatus);

export default router;
