import express from "express";

import internalAuthMiddleware from "../middleware/internalAuthMiddleware.js";
import { uploadMedicalReport } from "../middleware/uploadMiddleware.js";
import {
  getMyPatientReports,
  getPatientReportById,
  getSharedWithMePatientReports,
  grantDoctorAccessToPatientReport,
  uploadPatientReport,
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

router.get("/:id", internalAuthMiddleware, getPatientReportById);

router.get("/", internalAuthMiddleware, getMyPatientReports);

export default router;
