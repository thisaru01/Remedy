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

    const appointment = await appointmentService.getAppointmentById(id, req.user);

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

export const acceptAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await appointmentService.acceptAppointment(id, req.user);

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

export const rejectAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await appointmentService.rejectAppointment(id, req.user);

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

export const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await appointmentService.cancelAppointment(id, req.user);

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

export const rescheduleAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await appointmentService.rescheduleAppointment(
      id,
      req.user,
      req.body,
    );

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

export const completeAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await appointmentService.completeAppointment(id, req.user);

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
export const deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await appointmentService.deleteAppointment(id, req.user);

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

