import { v4 as uuidv4 } from "uuid";
import {
  buildJaasJoinUrl,
  isJaasEnabled,
} from "../config/jaas.js";
import { fetchAppointmentById } from "../clients/appointmentClient.js";

const joinTokenRateLimitWindowMs = 60 * 1000;
const joinTokenMaxRequestsPerWindow = 10;
const joinTokenRequestCounter = new Map();

export const canAccessSession = (session, user) => {
  return (
    session.patientId === user.id ||
    session.doctorId === user.id ||
    user.role === "admin"
  );
};

export const checkJoinTokenRateLimit = (userId, sessionId) => {
  const now = Date.now();
  const key = `${userId}:${sessionId}`;
  const bucket = joinTokenRequestCounter.get(key) || {
    count: 0,
    resetAt: now + joinTokenRateLimitWindowMs,
  };

  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + joinTokenRateLimitWindowMs;
  }

  bucket.count += 1;
  joinTokenRequestCounter.set(key, bucket);

  return bucket.count <= joinTokenMaxRequestsPerWindow;
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
    return false;
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
