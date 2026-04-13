import express from "express";

import internalAuthMiddleware from "../middleware/internalAuthMiddleware.js";
import {
  createDoctorPrescription,
  getDoctorPrescriptionByAppointmentId,
  getDoctorPrescriptionById,
  getMyDoctorPrescriptions,
  getMyPatientPrescriptions,
} from "../controllers/doctorPrescriptionController.js";

const router = express.Router();

router.use(internalAuthMiddleware);

router.post("/appointment/:appointmentId", createDoctorPrescription);
router.get("/me", getMyDoctorPrescriptions);
router.get("/patient/me", getMyPatientPrescriptions);
router.get("/appointment/:appointmentId", getDoctorPrescriptionByAppointmentId);
router.get("/:id", getDoctorPrescriptionById);

export default router;
