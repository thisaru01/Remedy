import appointmentService from "../services/appointmentService.js";

export const createAppointment = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can create appointments",
      });
    }

    const appointment = await appointmentService.createAppointment(req.body);

    return res.status(201).json({
      success: true,
      appointment,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    return next(error);
  }
};

export const getAppointments = async (req, res, next) => {
  try {
    const { patientId, doctorId } = req.query;
    const filter = {};

    if (patientId) filter.patientId = patientId;
    if (doctorId) filter.doctorId = doctorId;

    // If requester is a patient or doctor, restrict to their own appointments
    if (req.user && req.user.role === "patient") {
      filter.patientId = req.user.id;
    } else if (req.user && req.user.role === "doctor") {
      filter.doctorId = req.user.id;
    }

    const appointments = await appointmentService.getAppointments(filter);

    return res.status(200).json({ success: true, appointments });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    return next(error);
  }
};

export const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await appointmentService.getAppointmentById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const userId = req.user.id;
    const role = req.user.role;

    const isPatientOwner =
      role === "patient" && appointment.patientId?.toString() === userId;
    const isDoctorOwner =
      role === "doctor" && appointment.doctorId?.toString() === userId;
    const isAdmin = role === "admin";

    if (!isPatientOwner && !isDoctorOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this appointment",
      });
    }

    return res.status(200).json({ success: true, appointment });
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }
    return next(error);
  }
};

export default { createAppointment };
