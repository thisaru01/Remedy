import express from "express";
import internalAuthMiddleware from "../middleware/internalAuthMiddleware.js";
import {
  createDoctorProfile,
  getApprovedDoctorProfiles,
  getApprovedDoctorProfilesBySpecialty,
  getDoctorProfilesByVerificationStatus,
  getOwnDoctorProfile,
  approveDoctorVerification,
  rejectDoctorVerification,
  submitOwnDoctorVerification,
  updateOwnDoctorProfile,
} from "../controllers/doctorProfileController.js";

const router = express.Router();

router.post("/", internalAuthMiddleware, createDoctorProfile);
router.get("/", internalAuthMiddleware, getDoctorProfilesByVerificationStatus);
router.get("/verified", internalAuthMiddleware, getApprovedDoctorProfiles);
router.get(
  "/verified/specialty/:specialty",
  internalAuthMiddleware,
  getApprovedDoctorProfilesBySpecialty,
);
router.patch(
  "/:id/verification/approve",
  internalAuthMiddleware,
  approveDoctorVerification,
);
router.patch(
  "/:id/verification/reject",
  internalAuthMiddleware,
  rejectDoctorVerification,
);
router.get("/me", internalAuthMiddleware, getOwnDoctorProfile);
router.put("/me", internalAuthMiddleware, updateOwnDoctorProfile);
router.put(
  "/me/verification",
  internalAuthMiddleware,
  submitOwnDoctorVerification,
);

export default router;
