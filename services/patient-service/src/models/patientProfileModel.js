import mongoose from "mongoose";

const patientProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model("PatientProfile", patientProfileSchema);
