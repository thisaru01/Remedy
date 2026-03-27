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
