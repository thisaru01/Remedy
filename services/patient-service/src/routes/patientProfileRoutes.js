import express from "express";
import internalAuthMiddleware from "../middleware/internalAuthMiddleware.js";
import {
  createPatientProfile,
  getPatientProfileByUserId,
  updateMyPatientProfile,
  updatePatientProfile,
} from "../controllers/patientProfileController.js";

const router = express.Router();

router.put("/me", internalAuthMiddleware, updateMyPatientProfile);

router.get("/:id", internalAuthMiddleware, getPatientProfileByUserId);

router.post("/", internalAuthMiddleware, createPatientProfile);
router.put("/", internalAuthMiddleware, updatePatientProfile);

export default router;
