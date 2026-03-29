import PatientProfile from "../models/patientProfileModel.js";
import mongoose from "mongoose";

// Create or upsert a patient profile for a given user
export const createPatientProfileService = async (body) => {
  const { userId, dateOfBirth, gender, phone, address } = body ?? {};

  if (!userId) {
    return {
      status: 400,
      body: {
        success: false,
        message: "userId is required",
      },
    };
  }

  const set = {};
  if (dateOfBirth !== undefined) set.dateOfBirth = dateOfBirth;
  if (gender !== undefined) set.gender = gender;
  if (phone !== undefined) set.phone = phone;
  if (address !== undefined) set.address = address;

  const update = {
    $setOnInsert: { userId },
    ...(Object.keys(set).length ? { $set: set } : {}),
  };

  const profile = await PatientProfile.findOneAndUpdate({ userId }, update, {
    upsert: true,
    returnDocument: "after",
    runValidators: true,
  });

  return {
    status: 201,
    body: {
      success: true,
      profile,
    },
  };
};

// Update an existing patient profile by userId
export const updatePatientProfileService = async (body) => {
  const { userId, dateOfBirth, gender, phone, address } = body ?? {};

  if (!userId) {
    return {
      status: 400,
      body: {
        success: false,
        message: "userId is required",
      },
    };
  }

  const set = {};
  if (dateOfBirth !== undefined) set.dateOfBirth = dateOfBirth;
  if (gender !== undefined) set.gender = gender;
  if (phone !== undefined) set.phone = phone;
  if (address !== undefined) set.address = address;

  if (!Object.keys(set).length) {
    return {
      status: 400,
      body: {
        success: false,
        message: "No profile fields provided to update",
      },
    };
  }

  const profile = await PatientProfile.findOneAndUpdate(
    { userId },
    { $set: set },
    { returnDocument: "after", runValidators: true },
  );

  if (!profile) {
    return {
      status: 404,
      body: {
        success: false,
        message: "Patient profile not found",
      },
    };
  }

  return {
    status: 200,
    body: {
      success: true,
      profile,
    },
  };
};

// Update the authenticated patient's own profile
export const updateMyPatientProfileService = async ({ user, body }) => {
  const role = user?.role;
  if (role !== "patient") {
    return {
      status: 403,
      body: {
        success: false,
        message: "Access denied",
      },
    };
  }

  const userId = user?.id;
  const { dateOfBirth, gender, phone, address } = body ?? {};

  if (!userId) {
    return {
      status: 400,
      body: {
        success: false,
        message: "x-user-id header is required",
      },
    };
  }

  const set = {};
  if (dateOfBirth !== undefined) set.dateOfBirth = dateOfBirth;
  if (gender !== undefined) set.gender = gender;
  if (phone !== undefined) set.phone = phone;
  if (address !== undefined) set.address = address;

  if (!Object.keys(set).length) {
    return {
      status: 400,
      body: {
        success: false,
        message: "No profile fields provided to update",
      },
    };
  }

  const profile = await PatientProfile.findOneAndUpdate(
    { userId },
    { $set: set },
    { returnDocument: "after", runValidators: true },
  );

  if (!profile) {
    return {
      status: 404,
      body: {
        success: false,
        message: "Patient profile not found",
      },
    };
  }

  return {
    status: 200,
    body: {
      success: true,
      profile,
    },
  };
};

// Get the authenticated patient's own profile
export const getMyPatientProfileService = async (user) => {
  const role = user?.role;
  if (role !== "patient") {
    return {
      status: 403,
      body: {
        success: false,
        message: "Access denied",
      },
    };
  }

  const userId = user?.id;

  if (!userId) {
    return {
      status: 400,
      body: {
        success: false,
        message: "x-user-id header is required",
      },
    };
  }

  if (!mongoose.isValidObjectId(userId)) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Invalid user id",
      },
    };
  }

  const profile = await PatientProfile.findOne({ userId });
  if (!profile) {
    return {
      status: 404,
      body: {
        success: false,
        message: "Patient profile not found",
      },
    };
  }

  return {
    status: 200,
    body: {
      success: true,
      profile,
    },
  };
};

// Get a patient profile by the user's id (doctor/admin access)
export const getPatientProfileByUserIdService = async ({ user, params }) => {
  const role = user?.role;
  if (!role || !["doctor", "admin"].includes(role)) {
    return {
      status: 403,
      body: {
        success: false,
        message: "Access denied",
      },
    };
  }

  const { id } = params ?? {};

  if (!id) {
    return {
      status: 400,
      body: {
        success: false,
        message: "id is required",
      },
    };
  }

  if (!mongoose.isValidObjectId(id)) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Invalid id",
      },
    };
  }

  const profile = await PatientProfile.findOne({ userId: id });
  if (!profile) {
    return {
      status: 404,
      body: {
        success: false,
        message: "Patient profile not found",
      },
    };
  }

  return {
    status: 200,
    body: {
      success: true,
      profile,
    },
  };
};
