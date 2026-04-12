import mongoose from "mongoose";
import DoctorProfile from "../models/doctorProfileModel.js";

const doctorUpdatableFields = [
  "specialty",
  "contactNo",
  "bio",
  "gender",
  "languages",
  "educations",
  "workingHospitals",
];

const createServiceError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const buildProfileSet = ({
  specialty,
  contactNo,
  gender,
  bio,
  languages,
  educations,
  workingHospitals,
}) => {
  const set = {};

  if (specialty !== undefined) set.specialty = specialty;
  if (contactNo !== undefined) set.contactNo = contactNo;
  if (gender !== undefined) set.gender = gender;
  if (bio !== undefined) set.bio = bio;
  if (languages !== undefined) set.languages = languages;
  if (educations !== undefined) set.educations = educations;
  if (workingHospitals !== undefined) set.workingHospitals = workingHospitals;

  return set;
};

const ensureDoctorRole = ({ userId, role, action }) => {
  if (!userId) {
    throw createServiceError(400, "Authenticated user id is required");
  }

  if (role !== "doctor") {
    throw createServiceError(403, `Only doctors can ${action}`);
  }
};

export const createDoctorProfile = async (payload) => {
  const { userId } = payload;

  if (!userId) {
    throw createServiceError(400, "userId is required");
  }

  const set = buildProfileSet(payload);
  const update = {
    $setOnInsert: { userId },
    ...(Object.keys(set).length ? { $set: set } : {}),
  };

  return DoctorProfile.findOneAndUpdate({ userId }, update, {
    upsert: true,
    returnDocument: "after",
    runValidators: true,
  });
};

export const getOwnDoctorProfile = async ({ userId, role }) => {
  ensureDoctorRole({ userId, role, action: "access doctor profiles" });

  const profile = await DoctorProfile.findOne({ userId });
  if (!profile) {
    throw createServiceError(404, "Doctor profile not found");
  }

  return profile;
};

export const updateOwnDoctorProfile = async ({ userId, role, updates }) => {
  ensureDoctorRole({ userId, role, action: "update doctor profiles" });

  const existingProfile = await DoctorProfile.findOne({ userId });
  if (!existingProfile) {
    throw createServiceError(404, "Doctor profile not found");
  }

  if (existingProfile.verification?.status !== "approved") {
    throw createServiceError(
      403,
      "Profile updates are allowed only after admin approval of doctor verification",
    );
  }

  const set = {};
  for (const field of doctorUpdatableFields) {
    if (updates[field] !== undefined) {
      set[field] = updates[field];
    }
  }

  if (Object.keys(set).length === 0) {
    throw createServiceError(400, "No valid profile fields were provided");
  }

  return DoctorProfile.findOneAndUpdate(
    { userId },
    {
      $set: set,
    },
    {
      new: true,
      runValidators: true,
    },
  );
};

export const submitOwnDoctorVerification = async ({
  userId,
  role,
  medicalLicenseNumber,
  medicalCouncil,
  licenseDocumentUrl,
}) => {
  ensureDoctorRole({ userId, role, action: "submit verification" });

  if (!medicalLicenseNumber || !licenseDocumentUrl) {
    throw createServiceError(
      400,
      "medicalLicenseNumber and licenseDocumentUrl are required",
    );
  }

  const existingProfile = await DoctorProfile.findOne({ userId });
  const verificationStatus =
    existingProfile?.verification?.status ?? "not_submitted";

  if (verificationStatus === "submitted") {
    throw createServiceError(
      403,
      "Verification is already submitted and pending admin review",
    );
  }

  if (verificationStatus === "approved") {
    throw createServiceError(
      403,
      "Verification is already approved and cannot be resubmitted",
    );
  }

  if (!["not_submitted", "rejected"].includes(verificationStatus)) {
    throw createServiceError(
      403,
      "Verification details cannot be submitted in the current status",
    );
  }

  return DoctorProfile.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: { userId },
      $set: {
        verification: {
          status: "submitted",
          medicalLicenseNumber,
          medicalCouncil,
          licenseDocumentUrl,
        },
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    },
  );
};

export const getApprovedDoctorProfiles = async () => {
  return DoctorProfile.find({
    "verification.status": "approved",
  }).sort({ updatedAt: -1 });
};

export const getApprovedDoctorProfilesBySpecialty = async ({ specialty }) => {
  if (!specialty) {
    throw createServiceError(400, "specialty is required");
  }

  const profiles = await DoctorProfile.find({
    "verification.status": "approved",
    specialty,
  }).sort({ updatedAt: -1 });

  return {
    specialty,
    profiles,
  };
};

const allowedVerificationStatuses = [
  "not_submitted",
  "submitted",
  "approved",
  "rejected",
];

export const getDoctorProfilesByVerificationStatus = async ({
  user,
  verificationStatus,
}) => {
  const role = user?.role;

  if (role !== "admin") {
    throw createServiceError(403, "Access denied");
  }

  if (!verificationStatus) {
    throw createServiceError(400, "verificationStatus is required");
  }

  if (!allowedVerificationStatuses.includes(verificationStatus)) {
    throw createServiceError(
      400,
      "Invalid verificationStatus. Allowed values: not_submitted, submitted, approved, rejected",
    );
  }

  const profiles = await DoctorProfile.find({
    "verification.status": verificationStatus,
  }).sort({ updatedAt: -1 });

  return {
    verificationStatus,
    profiles,
  };
};

export const approveDoctorVerification = async ({ user, doctorUserId }) => {
  const role = user?.role;

  if (role !== "admin") {
    throw createServiceError(403, "Access denied");
  }

  if (!doctorUserId) {
    throw createServiceError(400, "doctorUserId is required");
  }

  if (!mongoose.isValidObjectId(doctorUserId)) {
    throw createServiceError(400, "Invalid doctorUserId");
  }

  const profile = await DoctorProfile.findOne({ userId: doctorUserId });

  if (!profile) {
    throw createServiceError(404, "Doctor profile not found");
  }

  if (profile.verification?.status !== "submitted") {
    throw createServiceError(
      400,
      "Only submitted verifications can be approved",
    );
  }

  const updatedProfile = await DoctorProfile.findOneAndUpdate(
    { userId: doctorUserId },
    { $set: { "verification.status": "approved" } },
    { new: true, runValidators: true },
  );

  return updatedProfile;
};

export const rejectDoctorVerification = async ({ user, doctorUserId }) => {
  const role = user?.role;

  if (role !== "admin") {
    throw createServiceError(403, "Access denied");
  }

  if (!doctorUserId) {
    throw createServiceError(400, "doctorUserId is required");
  }

  if (!mongoose.isValidObjectId(doctorUserId)) {
    throw createServiceError(400, "Invalid doctorUserId");
  }

  const profile = await DoctorProfile.findOne({ userId: doctorUserId });

  if (!profile) {
    throw createServiceError(404, "Doctor profile not found");
  }

  if (profile.verification?.status !== "submitted") {
    throw createServiceError(
      400,
      "Only submitted verifications can be rejected",
    );
  }

  const updatedProfile = await DoctorProfile.findOneAndUpdate(
    { userId: doctorUserId },
    { $set: { "verification.status": "rejected" } },
    { new: true, runValidators: true },
  );

  return updatedProfile;
};
