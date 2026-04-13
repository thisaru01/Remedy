import express from "express";

import internalAuthMiddleware from "../middleware/internalAuthMiddleware.js";
import {
  createDoctorPrescription,
  finalizeDoctorPrescription,
  getDoctorPrescriptionByAppointmentId,
  getDoctorPrescriptionById,
  getMyDoctorPrescriptions,
  updateDoctorPrescription,
} from "../controllers/doctorPrescriptionController.js";

const router = express.Router();

router.use(internalAuthMiddleware);

router.post("/appointment/:appointmentId", createDoctorPrescription);
router.get("/me", getMyDoctorPrescriptions);
router.get("/appointment/:appointmentId", getDoctorPrescriptionByAppointmentId);
router.get("/:id", getDoctorPrescriptionById);
router.patch("/:id", updateDoctorPrescription);
router.patch("/:id/finalize", finalizeDoctorPrescription);

export default router;
