import Session from "../models/sessionModel.js";

// Create a new telemedicine session
export const createSession = async (req, res, next) => {
  try {
    const { appointmentId, doctorId, patientId } = req.body;

    if (!appointmentId || !doctorId || !patientId) {
      return res.status(400).json({
        success: false,
        message: "appointmentId, doctorId, and patientId are required",
      });
    }

    const session = await Session.create({ appointmentId, doctorId, patientId });

    return res.status(201).json({
      success: true,
      session,
    });
  } catch (error) {
    return next(error);
  }
};

// Get a session by ID
export const getSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    return res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    return next(error);
  }
};

// Update session status
export const updateSessionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["scheduled", "active", "completed", "cancelled"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    const update = { status };
    if (status === "active") update.startTime = new Date();
    if (status === "completed") update.endTime = new Date();

    const session = await Session.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    return res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    return next(error);
  }
};
