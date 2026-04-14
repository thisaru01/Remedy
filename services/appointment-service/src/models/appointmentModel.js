import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatientProfile",
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorProfile",
      required: true,
      index: true,
    },
    appointmentNumber: {
      type: String,
      required: true,
    },
    // Removed `date` and `time` fields — scheduling can be handled elsewhere
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled", "completed"],
      required: true,
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      required: true,
      default: "pending",
    },
    fee: {
      type: Number,
      required: true,
      default: 2500,
    },
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
      index: true,
    },
  },
  { timestamps: true },
);

appointmentSchema.index({ scheduleId: 1, appointmentNumber: 1 }, { unique: true });

export default mongoose.model("Appointment", appointmentSchema);
