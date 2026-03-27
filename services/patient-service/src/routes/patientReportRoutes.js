import express from "express";

import internalAuthMiddleware from "../middleware/internalAuthMiddleware.js";
import { uploadMedicalReport } from "../middleware/uploadMiddleware.js";
import {
  getMyPatientReports,
  uploadPatientReport,
} from "../controllers/patientReportController.js";

const router = express.Router();

router.post(
  "/",
  internalAuthMiddleware,
  uploadMedicalReport.single("report"),
  uploadPatientReport,
);

router.get("/", internalAuthMiddleware, getMyPatientReports);

export default router;
