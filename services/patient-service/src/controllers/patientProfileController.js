import PatientProfile from "../models/patientProfileModel.js";

export const createPatientProfile = async (req, res, next) => {
  try {
    const { userId, dateOfBirth, gender, phone, address } = req.body;

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
      new: true,
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
