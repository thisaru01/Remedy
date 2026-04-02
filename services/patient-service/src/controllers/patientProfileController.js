import {
  createPatientProfileService,
  updatePatientProfileService,
  updateMyPatientProfileService,
  getMyPatientProfileService,
  getPatientProfileByUserIdService,
} from "../services/patientProfileService.js";

// Handle create/upsert of a patient profile
export const createPatientProfile = async (req, res, next) => {
  try {
    const { status, body } = await createPatientProfileService(req.body);
    return res.status(status).json(body);
  } catch (error) {
    return next(error);
  }
};

// Handle updating a patient profile by userId
export const updatePatientProfile = async (req, res, next) => {
  try {
    const { status, body } = await updatePatientProfileService(req.body);
    return res.status(status).json(body);
  } catch (error) {
    return next(error);
  }
};

// Handle updating the authenticated patient's own profile
export const updateMyPatientProfile = async (req, res, next) => {
  try {
    const { status, body } = await updateMyPatientProfileService({
      user: req.user,
      body: req.body,
    });
    return res.status(status).json(body);
  } catch (error) {
    return next(error);
  }
};

// Handle fetching the authenticated patient's own profile
export const getMyPatientProfile = async (req, res, next) => {
  try {
    const { status, body } = await getMyPatientProfileService(req.user);
    return res.status(status).json(body);
  } catch (error) {
    return next(error);
  }
};

// Handle fetching a patient's profile by user id (doctor/admin)
export const getPatientProfileByUserId = async (req, res, next) => {
  try {
    const { status, body } = await getPatientProfileByUserIdService({
      user: req.user,
      params: req.params,
    });
    return res.status(status).json(body);
  } catch (error) {
    return next(error);
  }
};
