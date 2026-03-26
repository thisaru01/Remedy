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
    startYear: {
      type: Number,
      min: 1900,
      max: 3000,
    },
    endYear: {
      type: Number,
      min: 1900,
      max: 3000,
    },
    currentlyStudying: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const workExperienceSchema = new mongoose.Schema(
  {
    hospital: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    isCurrent: {
      type: Boolean,
      default: false,
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
    name: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
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
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    bio: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    dateOfBirth: {
      type: Date,
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
    },
    consultationFee: {
      type: Number,
      min: 0,
    },
    languages: {
      type: [String],
      default: [],
    },
    educations: {
      type: [educationSchema],
      default: [],
    },
    workExperiences: {
      type: [workExperienceSchema],
      default: [],
    },
    workingHospitals: {
      type: [workingHospitalSchema],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model("DoctorProfile", doctorProfileSchema);
