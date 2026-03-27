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

export default { createAppointment };

export const getAppointments = async (req, res, next) => {
  try {
    const { patientId, doctorId } = req.query;
    const filter = {};

    if (patientId) filter.patientId = patientId;
    if (doctorId) filter.doctorId = doctorId;

    // If requester is a patient, restrict to their own appointments
    if (req.user && req.user.role === "patient") {
      filter.patientId = req.user.id;
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
