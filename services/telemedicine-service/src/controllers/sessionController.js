import {
  mintJaasRoomToken,
} from "../config/jaas.js";
import { createSessionRecord, findSessionByAppointmentId } from "../repositories/sessionRepository.js";
import {
  getAccessibleSessionByAppointmentIdOrError,
  getAccessibleSessionByIdOrError,
  getPaginatedSessions,
  getSessionByIdOrError,
  validateCreateSessionPayload,
  validateSessionStatusInput,
  generateSecureRoomUrl,
  validateWithAppointmentService,
} from "../services/sessionService.js";
import {
  canCreateSessionForDoctor,
  canUpdateSessionStatus,
  canViewAllSessions,
  canViewDoctorSessions,
  canViewPatientSessions,
} from "../policies/sessionPolicy.js";

const defaultDeps = {
  mintJaasRoomToken,
  createSessionRecord,
  findSessionByAppointmentId,
  getAccessibleSessionByAppointmentIdOrError,
  getAccessibleSessionByIdOrError,
  getPaginatedSessions,
  getSessionByIdOrError,
  validateCreateSessionPayload,
  validateSessionStatusInput,
  generateSecureRoomUrl,
  validateWithAppointmentService,
  canCreateSessionForDoctor,
  canUpdateSessionStatus,
  canViewAllSessions,
  canViewDoctorSessions,
  canViewPatientSessions,
};

const controllerDeps = { ...defaultDeps };

// Test hook: allow controller unit tests to replace imported dependencies safely.
export const __setSessionControllerDepsForTest = (overrides = {}) => {
  Object.assign(controllerDeps, overrides);
};

export const __resetSessionControllerDepsForTest = () => {
  Object.assign(controllerDeps, defaultDeps);
};

const sendError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

const sendData = (res, status, data, extra = {}) => {
  return res.status(status).json({
    success: true,
    ...extra,
    data,
  });
};

const sendServiceError = (res, result) => {
  return sendError(res, result.error.status, result.error.message);
};


/**
 * @desc    Create a new telemedicine video session
 * @route   POST /api/sessions
 * @access  Private (Patient/Doctor)
 */
export const createSession = async (req, res, next) => {
  try {
    const { appointmentId, patientId, doctorId } = req.body;

    const createValidation = controllerDeps.validateCreateSessionPayload({ appointmentId, patientId, doctorId });
    if (createValidation.error) {
      return sendServiceError(res, createValidation);
    }

    // Only the doctor assigned to this appointment can create the session
    if (!controllerDeps.canCreateSessionForDoctor(req.user, doctorId)) {
      return sendError(res, 403, "Access Denied: Only the doctor assigned to this appointment can schedule the video consultation.");
    }

    let isValidAppointment;
    try {
      isValidAppointment = await controllerDeps.validateWithAppointmentService(appointmentId, {
        userId: req.user?.id,
        userRole: req.user?.role,
      });
    } catch (error) {
      // Appointment service is down right now
      return sendError(res, 503, "Appointment service is unavailable. Please try again later.");
    }

    if (!isValidAppointment) {
      return sendError(res, 400, "Appointment is invalid: payment has not been completed.");
    }

    // Find-or-create: return existing session if one already exists for this appointment
    const existingSession = await controllerDeps.findSessionByAppointmentId(appointmentId);
    if (existingSession) {
      return sendData(res, 200, existingSession, { message: "Session already exists" });
    }

    const { roomName, joinUrl } = controllerDeps.generateSecureRoomUrl();

    const session = await controllerDeps.createSessionRecord({
      appointmentId,
      patientId,
      doctorId,
      doctorName: req.user.name || "",
      roomName,
      joinUrl,
      status: "scheduled",
    });

    return sendData(res, 201, session, { message: "Secure video session created successfully" });
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
    const result = await controllerDeps.getAccessibleSessionByIdOrError(req.params.id, req.user);
    if (result.error) {
      return sendServiceError(res, result);
    }

    return sendData(res, 200, result.session);
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get a specific session by appointment ID
 * @route   GET /api/sessions/appointment/:appointmentId
 * @access  Private (Patient/Doctor assigned to the session)
 */
export const getSessionByAppointmentId = async (req, res, next) => {
  try {
    const result = await controllerDeps.getAccessibleSessionByAppointmentIdOrError(req.params.appointmentId, req.user);
    if (result.error) {
      return sendServiceError(res, result);
    }

    return sendData(res, 200, result.session);
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

    const statusValidation = controllerDeps.validateSessionStatusInput(status);
    if (statusValidation.error) {
      return sendServiceError(res, statusValidation);
    }

    const result = await controllerDeps.getSessionByIdOrError(req.params.id);
    if (result.error) {
      return sendServiceError(res, result);
    }

    const session = result.session;

    // Allow status updates only from the session's doctor or an admin
    if (!controllerDeps.canUpdateSessionStatus(req.user, session)) {
      return sendError(res, 403, "Only doctors assigned to this session or admins can update status");
    }

    session.status = status;

    if (status === "active" && !session.startedAt) {
      session.startedAt = new Date();
    } else if (status === "ended" && !session.endedAt) {
      session.endedAt = new Date();
    }

    await session.save();

    return sendData(res, 200, session, { message: `Session status updated to ${status}` });
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
    const requestedPatientId = req.params.patientId;
    if (!controllerDeps.canViewPatientSessions(req.user, requestedPatientId)) {
      return sendError(res, 403, "Access denied. You can only view your own patient sessions.");
    }

    const result = await controllerDeps.getPaginatedSessions({
      filter: { patientId: req.params.patientId },
      query: req.query,
    });

    return res.status(200).json({ success: true, ...result });
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
    const requestedDoctorId = req.params.doctorId;
    if (!controllerDeps.canViewDoctorSessions(req.user, requestedDoctorId)) {
      return sendError(res, 403, "Access denied. You can only view your own doctor sessions.");
    }

    const result = await controllerDeps.getPaginatedSessions({
      filter: { doctorId: req.params.doctorId },
      query: req.query,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get all sessions (admin only)
 * @route   GET /api/sessions
 * @access  Private (Admin)
 */
export const getAllSessions = async (req, res, next) => {
  try {
    if (!controllerDeps.canViewAllSessions(req.user)) {
      return sendError(res, 403, "Access denied. Admin privileges are required.");
    }

    const result = await controllerDeps.getPaginatedSessions({
      filter: {},
      query: req.query,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get secure join details for a session
 * @route   GET /api/sessions/:id/join
 * @access  Private (Session participants)
 */
export const getSessionJoinDetails = async (req, res, next) => {
  try {
    const result = await controllerDeps.getAccessibleSessionByIdOrError(req.params.id, req.user);
    if (result.error) {
      return sendServiceError(res, result);
    }

    const session = result.session;

    const joinDetails = {
      roomName: session.roomName,
      joinUrl: session.joinUrl,
      mode: "jaas",
      token: controllerDeps.mintJaasRoomToken({
        roomName: session.roomName,
        user: req.user,
      }),
    };

    return sendData(res, 200, joinDetails);
  } catch (error) {
    return next(error);
  }
};
