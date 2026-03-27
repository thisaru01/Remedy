import express from "express";
import { createAppointment } from "../controllers/appointmentController.js";

const router = express.Router();

// POST /api/appointments
router.post("/", createAppointment);

// GET /api/appointments
import { getAppointments } from "../controllers/appointmentController.js";
router.get("/", getAppointments);

export default router;
