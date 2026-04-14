import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import {
  buildJaasJoinUrl,
  isJaasEnabled,
} from "../config/jaas.js";
import { fetchAppointmentById } from "../clients/appointmentClient.js";
import {
  countSessions,
  findSessionByAppointmentId,
  findSessionById,
  listSessions,
} from "../repositories/sessionRepository.js";
import {
  canAccessSession,
} from "../policies/sessionPolicy.js";

const defaultDeps = {
  countSessions,
  findSessionByAppointmentId,
  findSessionById,
  listSessions,
  canAccessSession,
};

const serviceDeps = { ...defaultDeps };

// Test hook: allows unit tests to replace data/policy dependencies without touching runtime behavior.
export const __setSessionServiceDepsForTest = (overrides = {}) => {
  Object.assign(serviceDeps, overrides);
};

export const __resetSessionServiceDepsForTest = () => {
  Object.assign(serviceDeps, defaultDeps);
};

export const validateCreateSessionPayload = ({ appointmentId, patientId, doctorId }) => {
  if (!appointmentId || !patientId || !doctorId) {
    return {
      error: {
        status: 400,
        message: "Missing required fields: appointmentId, patientId, doctorId",
      },
    };
  }

  return { ok: true };
};

export const validateSessionStatusInput = (status) => {
  const validStatuses = ["scheduled", "active", "ended", "cancelled"];
  if (!validStatuses.includes(status)) {
    return {
      error: {
        status: 400,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      },
    };
  }

  return { ok: true };
};

export const getSessionByIdOrError = async (sessionId) => {
  if (!mongoose.isValidObjectId(sessionId)) {
    return {
      error: {
        status: 400,
        message: "Invalid session ID format",
      },
    };
  }

  const session = await serviceDeps.findSessionById(sessionId);
  if (!session) {
    return {
      error: {
        status: 404,
        message: "Session not found",
      },
    };
  }

  return { session };
};

export const getAccessibleSessionByIdOrError = async (sessionId, user) => {
  const result = await getSessionByIdOrError(sessionId);
  if (result.error) {
    return result;
  }

  if (!serviceDeps.canAccessSession(result.session, user)) {
    return {
      error: {
        status: 403,
        message: "Access denied. You are not a participant in this session.",
      },
    };
  }

  return result;
};

export const getAccessibleSessionByAppointmentIdOrError = async (appointmentId, user) => {
  const normalizedAppointmentId = String(appointmentId || "").trim();
  if (!normalizedAppointmentId) {
    return {
      error: {
        status: 400,
        message: "Appointment ID is required",
      },
    };
  }

  const session = await serviceDeps.findSessionByAppointmentId(normalizedAppointmentId);
  if (!session) {
    return {
      error: {
        status: 404,
        message: "Session not found for this appointment",
      },
    };
  }

  if (!serviceDeps.canAccessSession(session, user)) {
    return {
      error: {
        status: 403,
        message: "Access denied. You are not a participant in this session.",
      },
    };
  }

  return { session };
};

export const parsePaginationQuery = (query) => {
  const rawPage = Number(query.page);
  const rawLimit = Number(query.limit);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const limitBase = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.floor(rawLimit) : 10;
  const limit = Math.min(limitBase, 50);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const getPaginatedSessions = async ({ filter, query, sort = { createdAt: -1 } }) => {
  const { page, limit, skip } = parsePaginationQuery(query);

  const [sessions, total] = await Promise.all([
    serviceDeps.listSessions({ filter, sort, skip, limit }),
    serviceDeps.countSessions(filter),
  ]);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    count: sessions.length,
    data: sessions,
  };
};

export const validateWithAppointmentService = async (appointmentId) => {
  if (String(process.env.SKIP_APPOINTMENT_VALIDATION).trim() === "true") {
    console.warn("Skipping appointment validation");
    return true;
  }

  try {
    const appointment = await fetchAppointmentById(appointmentId);

    if (appointment.type !== "ONLINE") {
      console.error(`Appointment ${appointmentId} is physical, not online.`);
      return false;
    }

    if (appointment.status !== "PAID") {
      console.error(`Appointment ${appointmentId} is not paid yet.`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(
      `Appointment validation failed for ${appointmentId}: ${error.message}`,
    );
    // Rethrow so callers can handle service outages separately
    throw error;
  }
};

export const generateSecureRoomUrl = () => {
  if (!isJaasEnabled()) {
    throw new Error(
      "JaaS (JWT as a Service) is not enabled. Required environment variables: JAAS_ENABLED=true or JAAS_APP_ID, JAAS_KEY_ID, JAAS_PRIVATE_KEY"
    );
  }
  const roomName = `Remedy-Consult-${uuidv4()}`;
  const joinUrl = buildJaasJoinUrl(roomName);
  return { roomName, joinUrl };
};
