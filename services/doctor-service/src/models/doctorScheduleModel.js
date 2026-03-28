import mongoose from "mongoose";
import {
  calculateScheduleEndTime,
  DOCTOR_SCHEDULE_DAYS,
} from "../utils/doctorScheduleTimeUtils.js";

const doctorScheduleSchema = new mongoose.Schema(
  {
    doctorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    day: {
      type: String,
      required: true,
      enum: DOCTOR_SCHEDULE_DAYS,
    },
    startTime: {
      type: String,
      required: true,
      trim: true,
    },
    endTime: {
      type: String,
      trim: true,
    },
    slotCount: {
      type: Number,
      default: 6,
      enum: [6],
      immutable: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

doctorScheduleSchema.index(
  { doctorUserId: 1, day: 1, startTime: 1 },
  { unique: true },
);

doctorScheduleSchema.pre("validate", function setAutomaticEndTime() {
  const endTime = calculateScheduleEndTime(this.startTime);
  if (endTime === null) {
    this.invalidate(
      "startTime",
      "startTime must be in format h:mm AM/PM, e.g. 8:30 AM",
    );
    return;
  }

  this.endTime = endTime;
});

export default mongoose.model("DoctorSchedule", doctorScheduleSchema);
