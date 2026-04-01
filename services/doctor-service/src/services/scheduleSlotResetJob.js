import DoctorSchedule from "../models/doctorScheduleModel.js";
import { parse12HourTimeToMinutes } from "../utils/doctorScheduleTimeUtils.js";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Sri Lanka local time is UTC+5:30
const SRI_LANKA_OFFSET_MINUTES = 5 * 60 + 30;

export const startScheduleSlotResetJob = () => {
  const tick = async () => {
    const nowUtc = new Date();
    const localMs = nowUtc.getTime() + SRI_LANKA_OFFSET_MINUTES * 60 * 1000;
    const local = new Date(localMs);

    // Interpret schedule day and endTime in Sri Lanka local time
    const todayName = DAY_NAMES[local.getUTCDay()];
    const currentMinutes = local.getUTCHours() * 60 + local.getUTCMinutes();

    try {
      // Find schedules for today whose slotCount is not already 6
      const schedules = await DoctorSchedule.find(
        { day: todayName, slotCount: { $ne: 6 } },
        { endTime: 1 },
      ).lean();

      for (const schedule of schedules) {
        const endMinutes = parse12HourTimeToMinutes(schedule.endTime);

        // Only reset after the schedule's end time has passed
        if (endMinutes !== null && currentMinutes >= endMinutes) {
          await DoctorSchedule.updateOne(
            { _id: schedule._id },
            { $set: { slotCount: 6 } },
          );
        }
      }
    } catch (error) {
      console.error(
        "[ScheduleSlotResetJob] Failed to reset slotCount at end of day",
        error?.message || error,
      );
    }
  };

  // Run once on startup and then every minute.
  void tick();
  setInterval(() => {
    void tick();
  }, 60 * 1000);
};
