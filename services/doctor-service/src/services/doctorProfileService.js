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
