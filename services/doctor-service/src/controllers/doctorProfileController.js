import DoctorProfile from "../models/doctorProfileModel.js";

const getCurrentDoctorContext = (req) => {
  const userId = req.user?.id;
  const role = req.user?.role;

  return {
    userId,
    role,
  };
};

const doctorUpdatableFields = [
  "specialty",
  "contactNo",
  "bio",
  "gender",
  "languages",
  "educations",
  "workingHospitals",
];

export const createDoctorProfile = async (req, res, next) => {
  try {
    const {
      userId,
      specialty,
      contactNo,
      gender,
      bio,
      languages,
      educations,
      workingHospitals,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const set = {};
    if (specialty !== undefined) set.specialty = specialty;
    if (contactNo !== undefined) set.contactNo = contactNo;
    if (gender !== undefined) set.gender = gender;
    if (bio !== undefined) set.bio = bio;
    if (languages !== undefined) set.languages = languages;
    if (educations !== undefined) set.educations = educations;
    if (workingHospitals !== undefined) {
      set.workingHospitals = workingHospitals;
    }

    const update = {
      $setOnInsert: { userId },
      ...(Object.keys(set).length ? { $set: set } : {}),
    };

    const profile = await DoctorProfile.findOneAndUpdate({ userId }, update, {
      upsert: true,
      returnDocument: "after",
      runValidators: true,
    });

    return res.status(201).json({
      success: true,
      profile,
    });
  } catch (error) {
    return next(error);
  }
};

export const getOwnDoctorProfile = async (req, res, next) => {
  try {
    const { userId, role } = getCurrentDoctorContext(req);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Authenticated user id is required",
      });
    }

    if (role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can access doctor profiles",
      });
    }

    const profile = await DoctorProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateOwnDoctorProfile = async (req, res, next) => {
  try {
    const { userId, role } = getCurrentDoctorContext(req);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Authenticated user id is required",
      });
    }

    if (role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can update doctor profiles",
      });
    }

    const existingProfile = await DoctorProfile.findOne({ userId });
    if (!existingProfile) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    if (existingProfile.verification?.status === "not_submitted") {
      return res.status(403).json({
        success: false,
        message:
          "Please submit verification proof before updating profile information",
      });
    }

    const set = {};
    for (const field of doctorUpdatableFields) {
      if (req.body[field] !== undefined) {
        set[field] = req.body[field];
      }
    }

    if (Object.keys(set).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid profile fields were provided",
      });
    }

    const profile = await DoctorProfile.findOneAndUpdate(
      { userId },
      {
        $set: set,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully",
      profile,
    });
  } catch (error) {
    return next(error);
  }
};

export const submitOwnDoctorVerification = async (req, res, next) => {
  try {
    const { userId, role } = getCurrentDoctorContext(req);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Authenticated user id is required",
      });
    }

    if (role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can submit verification",
      });
    }

    const { medicalLicenseNumber, medicalCouncil, licenseDocumentUrl } =
      req.body;

    if (!medicalLicenseNumber || !licenseDocumentUrl) {
      return res.status(400).json({
        success: false,
        message:
          "medicalLicenseNumber and licenseDocumentUrl are required",
      });
    }

    const profile = await DoctorProfile.findOneAndUpdate(
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

    return res.status(200).json({
      success: true,
      message: "Verification submitted successfully",
      profile,
    });
  } catch (error) {
    return next(error);
  }
};
