import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import Session from "../models/sessionModel.js";

/**
 * Validates the appointment details with the Appointment Service.
 * Fails gracefully if the service is unreachable.
 */
const validateWithAppointmentService = async (appointmentId) => {
  if (String(process.env.SKIP_APPOINTMENT_VALIDATION).trim() === "true") {
    console.warn("Skipping appointment validation");
    return true; // Skip validation for standalone testing
  }

  try {
    const appointmentServiceUrl = process.env.APPOINTMENT_SERVICE_URL || "http://appointment-service:5000";
    
    // Fetch appointment details
    const response = await axios.get(`${appointmentServiceUrl}/api/appointments/${appointmentId}`, {
      headers: {
        "x-internal-token": process.env.INTERNAL_SERVICE_TOKEN
      },
      timeout: 3000, 
    });

    const appointment = response.data.data;

    // Ensure appointment is meant for telemedicine
    if (appointment.type !== "ONLINE") {
      console.error(`Appointment ${appointmentId} is physical, not online.`);
      return false;
    }
    
    // Ensure appointment is paid
    if (appointment.status !== "PAID") {
      console.error(`Appointment ${appointmentId} is not paid yet.`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Appointment validation failed for ${appointmentId}: ${error.message}`);
    return false; // Force failure if service is down or returns 404
  }
};

// Generate random room URL
const generateSecureRoomUrl = () => {
  const roomName = `Remedy-Consult-${uuidv4()}`;
  const baseUrl = process.env.JITSI_DOMAIN || "https://meet.jit.si";
  const joinUrl = `${baseUrl}/${roomName}`;
  return { roomName, joinUrl };
};


/**
 * @desc    Create a new telemedicine video session
 * @route   POST /api/sessions
 * @access  Private (Patient/Doctor)
 */
export const createSession = async (req, res, next) => {
  try {
    const { appointmentId, patientId, doctorId, scheduledAt } = req.body;

    if (!appointmentId || !patientId || !doctorId || !scheduledAt) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: appointmentId, patientId, doctorId, scheduledAt",
      });
    }

    // Role-based Access Control: Only the assigned doctor can manually create the meeting
    if (req.user.role !== "doctor" || req.user.id !== doctorId) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: Only the doctor assigned to this appointment can schedule the video consultation.",
      });
    }

    const isValidAppointment = await validateWithAppointmentService(appointmentId);
    if (!isValidAppointment) {
      return res.status(503).json({
        success: false,
        message: "Unable to validate appointment. Appointment service may be unavailable.",
      });
    }

    const { roomName, joinUrl } = generateSecureRoomUrl();

    const session = await Session.create({
      appointmentId,
      patientId,
      doctorId,
      roomName,
      joinUrl,
      scheduledAt,
      status: "scheduled",
    });

    return res.status(201).json({
      success: true,
      message: "Secure video session created successfully",
      data: session,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get a specific session by ID
 * @route   GET /api/sessions/:id
 * @access  Private (Patient/Doctor assigned to the session)
 */
export const getSessionById = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const userId = req.user.id;
    if (session.patientId !== userId && session.doctorId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not a participant in this session.",
      });
    }

    return res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Update session status (e.g., scheduled -> active -> ended)
 * @route   PATCH /api/sessions/:id/status
 * @access  Private (Usually Doctor or background worker)
 */
export const updateSessionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["scheduled", "active", "ended", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    session.status = status;

    if (status === "active" && !session.startedAt) {
      session.startedAt = new Date();
    } else if (status === "ended" && !session.endedAt) {
      session.endedAt = new Date();
    }

    await session.save();

    return res.status(200).json({
      success: true,
      message: `Session status updated to ${status}`,
      data: session,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get all sessions for a specific patient
 * @route   GET /api/sessions/patient/:patientId
 * @access  Private
 */
export const getSessionsByPatient = async (req, res, next) => {
  try {
    const sessions = await Session.find({ patientId: req.params.patientId }).sort({ scheduledAt: -1 });
    return res.status(200).json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get all sessions for a specific doctor
 * @route   GET /api/sessions/doctor/:doctorId
 * @access  Private
 */
export const getSessionsByDoctor = async (req, res, next) => {
  try {
    const sessions = await Session.find({ doctorId: req.params.doctorId }).sort({ scheduledAt: -1 });
    return res.status(200).json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    return next(error);
  }
};
