import mongoose from "mongoose";

const patientReportSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    appointmentId: {
      type: String,
      required: false,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    cloudinaryUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const PatientReport = mongoose.model("PatientReport", patientReportSchema);

export default PatientReport;
