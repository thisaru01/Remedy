import DoctorSchedule from "../models/doctorScheduleModel.js";

export const createDoctorSchedule = async ({
  doctorUserId,
  day,
  startTime,
  isAvailable,
}) => {
  return DoctorSchedule.create({
    doctorUserId,
    day,
    startTime,
    slotCount: 6,
    ...(isAvailable !== undefined ? { isAvailable } : {}),
  });
};

export const getSchedulesForDoctor = async (doctorUserId) => {
  return DoctorSchedule.find({ doctorUserId }).sort({
    day: 1,
    startTime: 1,
  });
};

export const updateDayAvailabilityForDoctor = async ({
  doctorUserId,
  day,
  isAvailable,
}) => {
  return DoctorSchedule.updateMany(
    { doctorUserId, day },
    {
      $set: { isAvailable },
    },
  );
};

export const getSchedulesByDoctorId = async (doctorId) => {
  return DoctorSchedule.find({ doctorUserId: doctorId }).sort({
    day: 1,
    startTime: 1,
  });
};

export const getScheduleByScheduleId = async (scheduleId) => {
  return DoctorSchedule.findById(scheduleId);
};

export const getAllSchedules = async () => {
  return DoctorSchedule.find().sort({
    doctorUserId: 1,
    day: 1,
    startTime: 1,
  });
};

export const updateDoctorSchedule = async ({
  scheduleId,
  doctorUserId,
  day,
  startTime,
  isAvailable,
}) => {
  return DoctorSchedule.findOneAndUpdate(
    { _id: scheduleId, doctorUserId },
    {
      $set: {
        ...(day !== undefined ? { day } : {}),
        ...(startTime !== undefined ? { startTime } : {}),
        ...(isAvailable !== undefined ? { isAvailable } : {}),
      },
    },
    { new: true, runValidators: true },
  );
};
