import express from "express";
import {
	createAppointment,
	getAppointments,
	getAppointmentById,
	acceptAppointment,
	rejectAppointment,
	cancelAppointment,
	rescheduleAppointment,
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

// PATCH /api/appointments/:id/cancel
router.patch("/:id/cancel", cancelAppointment);

// PATCH /api/appointments/:id/reschedule
router.patch("/:id/reschedule", rescheduleAppointment);

export default router;
