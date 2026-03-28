import express from "express";
import {
	createAppointment,
	getAppointments,
	getAppointmentById,
	acceptAppointment,
	rejectAppointment,
} from "../controllers/appointmentController.js";

const router = express.Router();

// POST /api/appointments
router.post("/", createAppointment);

// GET /api/appointments
router.get("/", getAppointments);

// GET /api/appointments/:id
router.get("/:id", getAppointmentById);

// PATCH /api/appointments/:id/accept
router.patch("/:id/accept", acceptAppointment);

// PATCH /api/appointments/:id/reject
router.patch("/:id/reject", rejectAppointment);

export default router;
