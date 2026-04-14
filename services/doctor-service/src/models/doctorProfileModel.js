import mongoose from "mongoose";

const educationSchema = new mongoose.Schema(
  {
    degree: {
      type: String,
      trim: true,
    },
    institution: {
      type: String,
      trim: true,
    },
    fieldOfStudy: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const workingHospitalSchema = new mongoose.Schema(
  {
    hospitalName: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const doctorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },
    specialty: {
      type: String,
      enum: [
        "General Physician",
        "Cardiologist",
        "Dermatologist",
        "Pediatrician",
        "Orthopedic Surgeon",
        "Gynecologist",
        "Neurologist",
        "Psychiatrist",
        "ENT Specialist",
        "Ophthalmologist",
      ],
    },
    contactNo: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    languages: {
      type: [String],
      default: [],
    },
    educations: {
      type: [educationSchema],
      default: [],
    },
    workingHospitals: {
      type: [workingHospitalSchema],
      default: [],
    },
    verification: {
      status: {
        type: String,
        enum: ["not_submitted", "submitted", "approved", "rejected"],
        default: "not_submitted",
      },
      medicalLicenseNumber: {
        type: String,
        trim: true,
      },
      medicalCouncil: {
        type: String,
        trim: true,
      },
      licenseDocumentUrl: {
        type: String,
        trim: true,
      },
    },
  },
  { timestamps: true },
);

// Index for unique medical license numbers
doctorProfileSchema.index(
  { "verification.medicalLicenseNumber": 1 },
  { unique: true, sparse: true }
);

export default mongoose.model("DoctorProfile", doctorProfileSchema);
