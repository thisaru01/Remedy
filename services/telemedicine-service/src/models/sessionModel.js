import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      required: true,
      trim: true,
    },
    patientId: {
      type: String,
      required: true,
      trim: true,
    },
    doctorId: {
      type: String,
      required: true,
      trim: true,
    },
    doctorName: {
      type: String,
      trim: true,
    },
    patientName: {
      type: String,
      trim: true,
    },
    roomName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    joinUrl: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "active", "ended", "cancelled"],
      default: "scheduled",
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Indexes used by the most common session list/look-up queries
sessionSchema.index({ patientId: 1, scheduledAt: -1 });
sessionSchema.index({ doctorId: 1, scheduledAt: -1 });
sessionSchema.index({ appointmentId: 1 }, { unique: true });

export default mongoose.model("Session", sessionSchema);
