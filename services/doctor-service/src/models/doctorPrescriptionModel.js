import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dosage: {
      type: String,
      required: true,
      trim: true,
    },
    frequency: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
    route: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const doctorPrescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },
    doctorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    patientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    diagnosis: {
      type: String,
      trim: true,
    },
    medications: {
      type: [medicationSchema],
      default: [],
    },
    advice: {
      type: String,
      trim: true,
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    issuedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

doctorPrescriptionSchema.index({ doctorUserId: 1, createdAt: -1 });
doctorPrescriptionSchema.index({ patientUserId: 1, createdAt: -1 });

export default mongoose.model("DoctorPrescription", doctorPrescriptionSchema);