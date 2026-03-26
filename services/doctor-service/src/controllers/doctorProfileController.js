import DoctorProfile from "../models/doctorProfileModel.js";

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
