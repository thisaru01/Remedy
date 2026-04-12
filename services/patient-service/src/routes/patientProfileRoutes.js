import express from "express";
import internalAuthMiddleware from "../middleware/internalAuthMiddleware.js";
import {
  createPatientProfile,
  getPatientProfileByUserId,
  getMyPatientProfile,
  updateMyPatientProfile,
  updatePatientProfile,
} from "../controllers/patientProfileController.js";

const router = express.Router();

// Update the authenticated patient's own profile
router.put("/me", internalAuthMiddleware, updateMyPatientProfile);

// Get the authenticated patient's own profile
router.get("/me", internalAuthMiddleware, getMyPatientProfile);

// Get a patient's profile by user id (doctor/admin)
router.get("/:id", internalAuthMiddleware, getPatientProfileByUserId);

// Create or upsert a patient profile
router.post("/", internalAuthMiddleware, createPatientProfile);

// Update a patient profile by userId
router.put("/", internalAuthMiddleware, updatePatientProfile);

export default router;
