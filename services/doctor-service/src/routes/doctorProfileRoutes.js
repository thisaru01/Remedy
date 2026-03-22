import express from "express";
import internalAuthMiddleware from "../middleware/internalAuthMiddleware.js";
import { createDoctorProfile } from "../controllers/doctorProfileController.js";

const router = express.Router();

router.post("/", internalAuthMiddleware, createDoctorProfile);

export default router;
