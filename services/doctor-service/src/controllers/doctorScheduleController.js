import DoctorSchedule from "../models/doctorScheduleModel.js";
import { DOCTOR_SCHEDULE_DAYS } from "../utils/doctorScheduleTimeUtils.js";

const getCurrentDoctorContext = (req) => {
  const userId = req.user?.id;
  const role = req.user?.role;

  return {
    userId,
    role,
  };
};

export const createOwnDoctorSchedule = async (req, res, next) => {
  try {
    const { userId, role } = getCurrentDoctorContext(req);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Authenticated user id is required",
      });
    }

    if (role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can create schedules",
      });
    }

    const { day, startTime, isAvailable } = req.body;

    if (!day || !startTime) {
      return res.status(400).json({
        success: false,
        message: "day and startTime are required",
      });
    }

    if (isAvailable !== undefined && typeof isAvailable !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be true or false",
      });
    }

    if (req.body.slotCount !== undefined) {
      return res.status(400).json({
        success: false,
        message: "slotCount is fixed to 6 and cannot be changed",
      });
    }

    const schedule = await DoctorSchedule.create({
      doctorUserId: userId,
      day,
      startTime,
      slotCount: 6,
      ...(isAvailable !== undefined ? { isAvailable } : {}),
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
    const { userId, role } = getCurrentDoctorContext(req);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Authenticated user id is required",
      });
    }

    if (role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can view schedules",
      });
    }

    const schedules = await DoctorSchedule.find({ doctorUserId: userId }).sort({
      day: 1,
      startTime: 1,
    });

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
    const { userId, role } = getCurrentDoctorContext(req);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Authenticated user id is required",
      });
    }

    if (role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can update schedule availability",
      });
    }

    const { day } = req.params;
    const { isAvailable } = req.body;

    if (!DOCTOR_SCHEDULE_DAYS.includes(day)) {
      return res.status(400).json({
        success: false,
        message: `day must be one of: ${DOCTOR_SCHEDULE_DAYS.join(", ")}`,
      });
    }

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isAvailable is required and must be true or false",
      });
    }

    const result = await DoctorSchedule.updateMany(
      {
        doctorUserId: userId,
        day,
      },
      {
        $set: { isAvailable },
      },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No schedules found for this day",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor day availability updated successfully",
      day,
      isAvailable,
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    return next(error);
  }
};

export const getScheduleByDoctorId = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "doctorId is required",
      });
    }

    const schedules = await DoctorSchedule.find({ doctorUserId: doctorId }).sort({
      day: 1,
      startTime: 1,
    });

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

export const getAllDoctorSchedules = async (req, res, next) => {
  try {
    const schedules = await DoctorSchedule.find().sort({
      doctorUserId: 1,
      day: 1,
      startTime: 1,
    });

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
