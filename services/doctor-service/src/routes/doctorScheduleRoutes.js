import express from "express";
import internalAuthMiddleware from "../middleware/internalAuthMiddleware.js";
import {
  createOwnDoctorSchedule,
  getOwnDoctorSchedules,
  updateOwnDoctorDayAvailability,
  updateOwnDoctorSchedule,
  getScheduleById,
  getScheduleByDoctorId,
  getSchedulesByDoctorIdAndAvailability,
  getAllDoctorSchedules,
} from "../controllers/doctorScheduleController.js";

const router = express.Router();

router.post("/me", internalAuthMiddleware, createOwnDoctorSchedule);
router.get("/me", internalAuthMiddleware, getOwnDoctorSchedules);
router.put("/me/:scheduleId", internalAuthMiddleware, updateOwnDoctorSchedule);
router.get("/all", getAllDoctorSchedules);
router.get("/filter", getSchedulesByDoctorIdAndAvailability);
router.put(
  "/me/:scheduleId/availability",
  internalAuthMiddleware,
  updateOwnDoctorDayAvailability,
);
router.get("/schedule/:scheduleId", getScheduleById);
// Public: fetch schedules by doctorId (no internal token required)
router.get("/:doctorId", getScheduleByDoctorId);

export default router;
