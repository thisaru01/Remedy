import {
  createPrescriptionForAppointment,
  getPrescriptionByAppointmentId,
  getPrescriptionById,
  listOwnDoctorPrescriptions,
} from "../services/doctorPrescriptionService.js";

const sendServiceError = (res, error) => {
  if (!error?.statusCode) return false;

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
  });

  return true;
};

export const createDoctorPrescription = async (req, res, next) => {
  try {
    const prescription = await createPrescriptionForAppointment({
      requester: req.user,
      appointmentId: req.params.appointmentId,
      payload: req.body,
    });

    return res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription,
    });
  } catch (error) {
    if (sendServiceError(res, error)) return;
    return next(error);
  }
};

export const getMyDoctorPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await listOwnDoctorPrescriptions({
      requester: req.user,
      query: req.query,
    });

    return res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    if (sendServiceError(res, error)) return;
    return next(error);
  }
};

export const getDoctorPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await getPrescriptionById({
      requester: req.user,
      prescriptionId: req.params.id,
    });

    return res.status(200).json({
      success: true,
      prescription,
    });
  } catch (error) {
    if (sendServiceError(res, error)) return;
    return next(error);
  }
};

export const getDoctorPrescriptionByAppointmentId = async (req, res, next) => {
  try {
    const prescription = await getPrescriptionByAppointmentId({
      requester: req.user,
      appointmentId: req.params.appointmentId,
    });

    return res.status(200).json({
      success: true,
      prescription,
    });
  } catch (error) {
    if (sendServiceError(res, error)) return;
    return next(error);
  }
};
