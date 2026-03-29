import { DOCTOR_SCHEDULE_DAYS } from "./doctorScheduleTimeUtils.js";
import mongoose from "mongoose";

export const getCurrentDoctorContext = (req) => {
  const userId = req.user?.id;
  const role = req.user?.role;

  return { userId, role };
};

export const ensureDoctorAccess = (res, context, actionMessage) => {
  const { userId, role } = context;

  if (!userId) {
    res.status(400).json({
      success: false,
      message: "Authenticated user id is required",
    });
    return false;
  }

  if (role !== "doctor") {
    res.status(403).json({
      success: false,
      message: `Only doctors can ${actionMessage}`,
    });
    return false;
  }

  return true;
};

export const validateCreateSchedulePayload = (res, body) => {
  const { day, startTime, isAvailable } = body;

  if (!day || !startTime) {
    res.status(400).json({
      success: false,
      message: "day and startTime are required",
    });
    return false;
  }

  if (isAvailable !== undefined && typeof isAvailable !== "boolean") {
    res.status(400).json({
      success: false,
      message: "isAvailable must be true or false",
    });
    return false;
  }

  if (body.slotCount !== undefined) {
    res.status(400).json({
      success: false,
      message: "slotCount is fixed to 6 and cannot be changed",
    });
    return false;
  }

  return true;
};

export const validateDayAvailabilityPayload = (res, day, isAvailable) => {
  if (!DOCTOR_SCHEDULE_DAYS.includes(day)) {
    res.status(400).json({
      success: false,
      message: `day must be one of: ${DOCTOR_SCHEDULE_DAYS.join(", ")}`,
    });
    return false;
  }

  if (typeof isAvailable !== "boolean") {
    res.status(400).json({
      success: false,
      message: "isAvailable is required and must be true or false",
    });
    return false;
  }

  return true;
};

export const validateDoctorIdParam = (res, doctorId) => {
  if (!doctorId) {
    res.status(400).json({
      success: false,
      message: "doctorId is required",
    });
    return false;
  }

  if (!mongoose.isValidObjectId(doctorId)) {
    res.status(400).json({
      success: false,
      message: "doctorId must be a valid ObjectId",
    });
    return false;
  }

  return true;
};

export const validateScheduleIdParam = (res, scheduleId) => {
  if (!scheduleId) {
    res.status(400).json({
      success: false,
      message: "scheduleId is required",
    });
    return false;
  }

  if (!mongoose.isValidObjectId(scheduleId)) {
    res.status(400).json({
      success: false,
      message: "scheduleId must be a valid ObjectId",
    });
    return false;
  }

  return true;
};

export const validateUpdateSchedulePayload = (res, body) => {
  const { day, startTime, isAvailable } = body;

  if (!day && !startTime && isAvailable === undefined) {
    res.status(400).json({
      success: false,
      message: "At least one field (day, startTime, or isAvailable) is required to update",
    });
    return false;
  }

  if (day && !DOCTOR_SCHEDULE_DAYS.includes(day)) {
    res.status(400).json({
      success: false,
      message: `day must be one of: ${DOCTOR_SCHEDULE_DAYS.join(", ")}`,
    });
    return false;
  }

  if (isAvailable !== undefined && typeof isAvailable !== "boolean") {
    res.status(400).json({
      success: false,
      message: "isAvailable must be true or false",
    });
    return false;
  }

  if (body.slotCount !== undefined) {
    res.status(400).json({
      success: false,
      message: "slotCount is fixed to 6 and cannot be changed",
    });
    return false;
  }

  return true;
};
