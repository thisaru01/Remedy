import mongoose from "mongoose";

const patientProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("PatientProfile", patientProfileSchema);
