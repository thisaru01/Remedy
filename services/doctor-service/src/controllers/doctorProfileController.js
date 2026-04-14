import * as doctorProfileService from "../services/doctorProfileService.js";

const getCurrentDoctorContext = (req) => {
  const userId = req.user?.id;
  const role = req.user?.role;

  return {
    userId,
    role,
  };
};

const sendServiceError = (res, error) => {
  if (!error?.statusCode) return false;

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
  });

  return true;
};

export const createDoctorProfile = async (req, res, next) => {
  try {
    const profile = await doctorProfileService.createDoctorProfile(req.body);

    return res.status(201).json({
      success: true,
      profile,
    });
  } catch (error) {
    if (sendServiceError(res, error)) return;
    return next(error);
  }
};

export const getOwnDoctorProfile = async (req, res, next) => {
  try {
    const profile = await doctorProfileService.getOwnDoctorProfile(
      getCurrentDoctorContext(req),
    );

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    if (sendServiceError(res, error)) return;
    return next(error);
  }
};

export const updateOwnDoctorProfile = async (req, res, next) => {
  try {
    const profile = await doctorProfileService.updateOwnDoctorProfile({
      ...getCurrentDoctorContext(req),
      updates: req.body,
    });

    return res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully",
      profile,
    });
  } catch (error) {
    if (sendServiceError(res, error)) return;
    return next(error);
  }
};

export const submitOwnDoctorVerification = async (req, res, next) => {
  try {
    const profile = await doctorProfileService.submitOwnDoctorVerification({
      ...getCurrentDoctorContext(req),
      medicalLicenseNumber: req.body.medicalLicenseNumber,
      medicalCouncil: req.body.medicalCouncil,
      licenseDocumentUrl: req.body.licenseDocumentUrl,
    });

    return res.status(200).json({
      success: true,
      message: "Verification submitted successfully",
      profile,
    });
  } catch (error) {
    if (sendServiceError(res, error)) return;
    return next(error);
  }
};

export const getApprovedDoctorProfiles = async (req, res, next) => {
  try {
    const profiles = await doctorProfileService.getApprovedDoctorProfiles();

    return res.status(200).json({
      success: true,
      count: profiles.length,
      profiles,
    });
  } catch (error) {
    if (sendServiceError(res, error)) return;
    return next(error);
  }
};

export const getApprovedDoctorProfilesBySpecialty = async (req, res, next) => {
  try {
    const { specialty, profiles } =
      await doctorProfileService.getApprovedDoctorProfilesBySpecialty({
        specialty: req.params.specialty,
      });

    return res.status(200).json({
      success: true,
      specialty,
      count: profiles.length,
      profiles,
    });
  } catch (error) {
    if (sendServiceError(res, error)) return;
    return next(error);
  }
};

export const getDoctorFullDetails = async (req, res, next) => {
  try {
    const profile = await doctorProfileService.getDoctorFullDetails({
      doctorUserId: req.params.id,
    });

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    if (sendServiceError(res, error)) return;
    return next(error);
  }
};

export const getDoctorProfilesByVerificationStatus = async (req, res, next) => {
  try {
    const { verificationStatus, profiles } =
      await doctorProfileService.getDoctorProfilesByVerificationStatus({
        user: req.user,
        verificationStatus: req.query.verificationStatus,
      });

    return res.status(200).json({
      success: true,
      verificationStatus,
      count: profiles.length,
      profiles,
    });
  } catch (error) {
    if (sendServiceError(res, error)) return;
    return next(error);
  }
};

export const approveDoctorVerification = async (req, res, next) => {
  try {
    const profile = await doctorProfileService.approveDoctorVerification({
      user: req.user,
      doctorUserId: req.params.id,
    });

    return res.status(200).json({
      success: true,
      message: "Doctor verification approved",
      profile,
    });
  } catch (error) {
    if (sendServiceError(res, error)) return;
    return next(error);
  }
};

export const rejectDoctorVerification = async (req, res, next) => {
  try {
    const profile = await doctorProfileService.rejectDoctorVerification({
      user: req.user,
      doctorUserId: req.params.id,
    });

    return res.status(200).json({
      success: true,
      message: "Doctor verification rejected",
      profile,
    });
  } catch (error) {
    if (sendServiceError(res, error)) return;
    return next(error);
  }
};
