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
    sharedWith: {
      type: [
        {
          doctorId: {
            type: String,
            required: true,
            index: true,
          },
          grantedAt: {
            type: Date,
            required: true,
            default: Date.now,
          },
          expiresAt: {
            type: Date,
            required: false,
            default: null,
          },
        },
      ],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const PatientReport = mongoose.model("PatientReport", patientReportSchema);

export default PatientReport;
