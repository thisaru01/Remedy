import express from "express";

import internalAuthMiddleware from "../middleware/internalAuthMiddleware.js";
import { uploadMedicalReport } from "../middleware/uploadMiddleware.js";
import {
  getMyPatientReports,
  getPatientReportById,
  getSharedWithMePatientReports,
  grantDoctorAccessToPatientReport,
  revokeDoctorAccessToPatientReport,
  uploadPatientReport,
  getReportsForAppointment,
} from "../controllers/patientReportController.js";

const router = express.Router();

router.post(
  "/",
  internalAuthMiddleware,
  uploadMedicalReport.single("report"),
  uploadPatientReport,
);

router.post(
  "/:id/grant-access",
  internalAuthMiddleware,
  grantDoctorAccessToPatientReport,
);

router.get(
  "/shared-with-me",
  internalAuthMiddleware,
  getSharedWithMePatientReports,
);

// For doctors to fetch all reports attached to a specific appointment
// where they are the doctor and the patient matches the report owner.
router.get(
  "/by-appointment/:appointmentId",
  internalAuthMiddleware,
  getReportsForAppointment,
);

router.get("/:id", internalAuthMiddleware, getPatientReportById);
router.delete(
  "/:id/grant-access/:doctorId",
  internalAuthMiddleware,
  revokeDoctorAccessToPatientReport,
);

router.get("/", internalAuthMiddleware, getMyPatientReports);

export default router;
