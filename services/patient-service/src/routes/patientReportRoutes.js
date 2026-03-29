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
  deletePatientReport,
  getReportsForAppointment,
} from "../controllers/patientReportController.js";

const router = express.Router();

// Upload a new medical report for the authenticated patient
router.post(
  "/",
  internalAuthMiddleware,
  uploadMedicalReport.single("report"),
  uploadPatientReport,
);

// Grant or update a doctor's access to a specific report
router.post(
  "/:id/grant-access",
  internalAuthMiddleware,
  grantDoctorAccessToPatientReport,
);

// Get all reports that are shared with the authenticated doctor
router.get(
  "/shared-with-me",
  internalAuthMiddleware,
  getSharedWithMePatientReports,
);

// Get all reports for a specific appointment
router.get(
  "/by-appointment/:appointmentId",
  internalAuthMiddleware,
  getReportsForAppointment,
);

// Get a single report by id
router.get("/:id", internalAuthMiddleware, getPatientReportById);

// Delete a report owned by the authenticated patient
router.delete("/:id", internalAuthMiddleware, deletePatientReport);

// Revoke a doctor's access to a specific report
router.delete(
  "/:id/grant-access/:doctorId",
  internalAuthMiddleware,
  revokeDoctorAccessToPatientReport,
);

// Get all reports for the authenticated patient
router.get("/", internalAuthMiddleware, getMyPatientReports);

export default router;
