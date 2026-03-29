import {
  createDoctorSchedule,
  getAllSchedules,
  getScheduleByScheduleId,
  getSchedulesByDoctorId,
  getSchedulesByDoctorIdAndAvailability as getSchedulesByDoctorIdAndAvailabilityService,
  getSchedulesForDoctor,
  updateScheduleAvailabilityForDoctor,
  updateDoctorSchedule,
  updateScheduleSlotCountById,
} from "../services/doctorScheduleService.js";
import DoctorProfile from "../models/doctorProfileModel.js";
import {
  ensureDoctorAccess,
  getCurrentDoctorContext,
  validateCreateSchedulePayload,
  validateDoctorIdParam,
  validateScheduleIdParam,
  validateUpdateSchedulePayload,
} from "../utils/validation.js";

const ensureDoctorVerificationApproved = async (res, userId) => {
  const profile = await DoctorProfile.findOne(
    { userId },
    { verification: 1 },
  ).lean();

  if (!profile) {
    res.status(404).json({
      success: false,
      message: "Doctor profile not found",
    });
    return false;
  }

  if (profile.verification?.status !== "approved") {
    res.status(403).json({
      success: false,
      message:
        "Only admin-approved doctors can create or update schedules",
    });
    return false;
  }

  return true;
};

export const createOwnDoctorSchedule = async (req, res, next) => {
  try {
    const context = getCurrentDoctorContext(req);
    if (!ensureDoctorAccess(res, context, "create schedules")) return;
    if (!(await ensureDoctorVerificationApproved(res, context.userId))) return;

    const { day, startTime, isAvailable } = req.body;
    if (!validateCreateSchedulePayload(res, req.body)) return;

    const schedule = await createDoctorSchedule({
      doctorUserId: context.userId,
      day,
      startTime,
      isAvailable,
    });

    return res.status(201).json({
      success: true,
      message: "Doctor schedule created successfully",
      schedule,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A schedule already exists for this day and startTime",
      });
    }

    if (error?.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return next(error);
  }
};

export const getOwnDoctorSchedules = async (req, res, next) => {
  try {
    const context = getCurrentDoctorContext(req);
    if (!ensureDoctorAccess(res, context, "view schedules")) return;

    const schedules = await getSchedulesForDoctor(context.userId);

    return res.status(200).json({
      success: true,
      schedules,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateOwnDoctorDayAvailability = async (req, res, next) => {
  try {
    const context = getCurrentDoctorContext(req);
    if (!ensureDoctorAccess(res, context, "update schedule availability")) {
      return;
    }
    if (!(await ensureDoctorVerificationApproved(res, context.userId))) return;

    const { scheduleId } = req.params;
    const { isAvailable } = req.body;

    if (!validateScheduleIdParam(res, scheduleId)) return;
    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isAvailable is required and must be true or false",
      });
    }

    const schedule = await updateScheduleAvailabilityForDoctor({
      doctorUserId: context.userId,
      scheduleId,
      isAvailable,
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found or does not belong to this doctor",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor schedule availability updated successfully",
      schedule,
    });
  } catch (error) {
    return next(error);
  }
};

export const getScheduleByDoctorId = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    if (!validateDoctorIdParam(res, doctorId)) return;

    const schedules = await getSchedulesByDoctorId(doctorId);

    if (schedules.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No schedules found for this doctor",
      });
    }

    return res.status(200).json({
      success: true,
      schedules,
    });
  } catch (error) {
    return next(error);
  }
};

export const getSchedulesByDoctorIdAndAvailability = async (
  req,
  res,
  next,
) => {
  try {
    const { doctorId, isAvailable } = req.query;

    if (!validateDoctorIdParam(res, doctorId)) return;

    if (isAvailable === undefined) {
      return res.status(400).json({
        success: false,
        message: "isAvailable query param is required (true or false)",
      });
    }

    if (isAvailable !== "true" && isAvailable !== "false") {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be 'true' or 'false'",
      });
    }

    const schedules = await getSchedulesByDoctorIdAndAvailabilityService({
      doctorId,
      isAvailable: isAvailable === "true",
    });

    if (schedules.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No schedules found for this doctor with requested availability",
      });
    }

    return res.status(200).json({
      success: true,
      count: schedules.length,
      schedules,
    });
  } catch (error) {
    return next(error);
  }
};

export const getScheduleById = async (req, res, next) => {
  try {
    const { scheduleId } = req.params;

    if (!validateScheduleIdParam(res, scheduleId)) return;

    const schedule = await getScheduleByScheduleId(scheduleId);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    return res.status(200).json({
      success: true,
      schedule,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateOwnDoctorSchedule = async (req, res, next) => {
  try {
    const context = getCurrentDoctorContext(req);
    if (!ensureDoctorAccess(res, context, "update schedules")) return;
    if (!(await ensureDoctorVerificationApproved(res, context.userId))) return;

    const { scheduleId } = req.params;
    const { day, startTime, isAvailable } = req.body;

    if (!validateScheduleIdParam(res, scheduleId)) return;

    if (!validateUpdateSchedulePayload(res, req.body)) return;

    const schedule = await updateDoctorSchedule({
      scheduleId,
      doctorUserId: context.userId,
      day,
      startTime,
      isAvailable,
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found or does not belong to this doctor",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor schedule updated successfully",
      schedule,
    });
  } catch (error) {
    if (error?.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return next(error);
  }
};

export const getAllDoctorSchedules = async (req, res, next) => {
  try {
    const schedules = await getAllSchedules();

    if (schedules.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No schedules found",
        schedules: [],
      });
    }

    return res.status(200).json({
      success: true,
      count: schedules.length,
      schedules,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateScheduleSlotCountFromAppointment = async (
  req,
  res,
  next,
) => {
  try {
    if (req.user?.id || req.user?.role) {
      return res.status(403).json({
        success: false,
        message: "This endpoint is internal and not accessible by doctor users",
      });
    }

    const { scheduleId } = req.params;
    const { slotCount } = req.body;

    if (!validateScheduleIdParam(res, scheduleId)) return;

    if (!Number.isInteger(slotCount)) {
      return res.status(400).json({
        success: false,
        message: "slotCount is required and must be an integer",
      });
    }

    if (slotCount < 0 || slotCount > 6) {
      return res.status(400).json({
        success: false,
        message: "slotCount must be between 0 and 6",
      });
    }

    const schedule = await updateScheduleSlotCountById({
      scheduleId,
      slotCount,
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Schedule slotCount updated successfully",
      schedule,
    });
  } catch (error) {
    if (error?.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return next(error);
  }
};
