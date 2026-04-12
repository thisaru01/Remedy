import axios from "axios";

const DEFAULT_APPOINTMENT_SERVICE_URL = "http://appointment-service:5000";
const DEFAULT_APPOINTMENT_TIMEOUT_MS = 3000;

const getAppointmentServiceUrl = () => {
  return (
    process.env.APPOINTMENT_SERVICE_URL || DEFAULT_APPOINTMENT_SERVICE_URL
  ).trim();
};

const getAppointmentServiceTimeoutMs = () => {
  const rawValue = (process.env.APPOINTMENT_SERVICE_TIMEOUT_MS || "").trim();
  if (!rawValue) {
    return DEFAULT_APPOINTMENT_TIMEOUT_MS;
  }

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_APPOINTMENT_TIMEOUT_MS;
  }

  return parsed;
};

export const fetchAppointmentByIdForUser = async (appointmentId, requester) => {
  const appointmentServiceUrl = getAppointmentServiceUrl();
  const timeoutMs = getAppointmentServiceTimeoutMs();

  const headers = {
    "x-internal-token": process.env.INTERNAL_SERVICE_TOKEN,
  };

  if (requester && requester.id) {
    headers["x-user-id"] = String(requester.id);
  }
  if (requester && requester.role) {
    headers["x-user-role"] = String(requester.role);
  }

  const response = await axios.get(
    `${appointmentServiceUrl}/api/appointments/${appointmentId}`,
    {
      headers,
      timeout: timeoutMs,
    },
  );

  const data = response.data || {};

  // Support both { success, appointment } and { success, data }
  return data.appointment || data.data || null;
};
