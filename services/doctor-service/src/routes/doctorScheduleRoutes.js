import express from "express";
import internalAuthMiddleware from "../middleware/internalAuthMiddleware.js";
import {
  createOwnDoctorSchedule,
  getOwnDoctorSchedules,
  updateOwnDoctorDayAvailability,
} from "../controllers/doctorScheduleController.js";

const router = express.Router();

router.post("/me", internalAuthMiddleware, createOwnDoctorSchedule);
router.get("/me", internalAuthMiddleware, getOwnDoctorSchedules);
router.put(
  "/me/day/:day/availability",
  internalAuthMiddleware,
  updateOwnDoctorDayAvailability,
);

export default router;
