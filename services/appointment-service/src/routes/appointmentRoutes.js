import express from "express";
import {
	createAppointment,
	getAppointments,
	getAppointmentById,
} from "../controllers/appointmentController.js";

const router = express.Router();

// POST /api/appointments
router.post("/", createAppointment);

// GET /api/appointments
router.get("/", getAppointments);

// GET /api/appointments/:id
router.get("/:id", getAppointmentById);

export default router;
