import mongoose from "mongoose";

const aiAssessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    role: {
      type: String,
      trim: true,
    },
    symptoms: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      trim: true,
    },
    duration: {
      type: String,
      trim: true,
    },
    additionalInfo: {
      type: String,
      trim: true,
    },
    assessment: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true },
);

aiAssessmentSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("AiAssessment", aiAssessmentSchema);
