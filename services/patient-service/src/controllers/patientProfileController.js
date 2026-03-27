import PatientProfile from "../models/patientProfileModel.js";
import mongoose from "mongoose";

export const createPatientProfile = async (req, res, next) => {
  try {
    const { userId, dateOfBirth, gender, phone, address } = req.body ?? {};

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
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

    return res.status(201).json({
      success: true,
      profile,
    });
  } catch (error) {
    return next(error);
  }
};

export const updatePatientProfile = async (req, res, next) => {
  try {
    const { userId, dateOfBirth, gender, phone, address } = req.body ?? {};

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const set = {};
    if (dateOfBirth !== undefined) set.dateOfBirth = dateOfBirth;
    if (gender !== undefined) set.gender = gender;
    if (phone !== undefined) set.phone = phone;
    if (address !== undefined) set.address = address;

    if (!Object.keys(set).length) {
      return res.status(400).json({
        success: false,
        message: "No profile fields provided to update",
      });
    }

    const profile = await PatientProfile.findOneAndUpdate(
      { userId },
      { $set: set },
      { returnDocument: "after", runValidators: true },
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
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

export const updateMyPatientProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { dateOfBirth, gender, phone, address } = req.body ?? {};

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "x-user-id header is required",
      });
    }

    const set = {};
    if (dateOfBirth !== undefined) set.dateOfBirth = dateOfBirth;
    if (gender !== undefined) set.gender = gender;
    if (phone !== undefined) set.phone = phone;
    if (address !== undefined) set.address = address;

    if (!Object.keys(set).length) {
      return res.status(400).json({
        success: false,
        message: "No profile fields provided to update",
      });
    }

    const profile = await PatientProfile.findOneAndUpdate(
      { userId },
      { $set: set },
      { returnDocument: "after", runValidators: true },
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
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

export const getMyPatientProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "x-user-id header is required",
      });
    }

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const profile = await PatientProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
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

export const getPatientProfileByUserId = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id is required",
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid id",
      });
    }

    const profile = await PatientProfile.findOne({ userId: id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
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
