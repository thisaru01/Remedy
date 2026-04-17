import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      required: true,
      default: "LKR",
      uppercase: true,
      trim: true,
    },
    provider: {
      type: String,
      enum: ["stripe"],
      required: true,
      default: "stripe",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      required: true,
      default: "pending",
    },
    checkoutSessionId: {
      type: String,
      trim: true,
    },
    checkoutUrl: {
      type: String,
      trim: true,
    },
    providerPaymentIntentId: {
      type: String,
      trim: true,
    },
    failureReason: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Payment", paymentSchema);
