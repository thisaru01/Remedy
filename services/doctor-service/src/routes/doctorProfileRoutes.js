import express from "express";
import internalAuthMiddleware from "../middleware/internalAuthMiddleware.js";
import {
  createDoctorProfile,
  getOwnDoctorProfile,
  updateOwnDoctorProfile,
} from "../controllers/doctorProfileController.js";

const router = express.Router();

router.post("/", internalAuthMiddleware, createDoctorProfile);
router.get("/me", internalAuthMiddleware, getOwnDoctorProfile);
router.put("/me", internalAuthMiddleware, updateOwnDoctorProfile);

export default router;
