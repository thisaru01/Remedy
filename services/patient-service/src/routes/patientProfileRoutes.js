import express from "express";
import internalAuthMiddleware from "../middleware/internalAuthMiddleware.js";
import { createPatientProfile } from "../controllers/patientProfileController.js";

const router = express.Router();

router.post("/", internalAuthMiddleware, createPatientProfile);

export default router;
