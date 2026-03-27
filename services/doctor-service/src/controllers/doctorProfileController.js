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
  "phone",
  "address",
  "bio",
  "gender",
  "dateOfBirth",
  "yearsOfExperience",
  "consultationFee",
  "languages",
  "educations",
  "workExperiences",
  "workingHospitals",
];

export const createDoctorProfile = async (req, res, next) => {
  try {
    const { userId, specialty, phone, address, bio } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const set = {};
    if (specialty !== undefined) set.specialty = specialty;
    if (phone !== undefined) set.phone = phone;
    if (address !== undefined) set.address = address;
    if (bio !== undefined) set.bio = bio;

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
        $setOnInsert: { userId },
        $set: set,
      },
      {
        upsert: true,
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

    const {
      idType,
      idNumber,
      medicalLicenseNumber,
      medicalCouncil,
      idDocumentUrl,
      licenseDocumentUrl,
    } = req.body;

    if (!idType || !idNumber || !medicalLicenseNumber) {
      return res.status(400).json({
        success: false,
        message: "idType, idNumber and medicalLicenseNumber are required",
      });
    }

    const profile = await DoctorProfile.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: { userId },
        $set: {
          verification: {
            status: "submitted",
            idType,
            idNumber,
            medicalLicenseNumber,
            medicalCouncil,
            idDocumentUrl,
            licenseDocumentUrl,
            submittedAt: new Date(),
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
