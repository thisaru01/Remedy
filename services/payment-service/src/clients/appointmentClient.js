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

  if (requester?.id) {
    headers["x-user-id"] = String(requester.id);
  }
  if (requester?.role) {
    headers["x-user-role"] = String(requester.role);
  }
  if (requester?.name) {
    headers["x-user-name"] = String(requester.name);
  }

  const response = await axios.get(
    `${appointmentServiceUrl}/api/appointments/${appointmentId}`,
    {
      headers,
      timeout: timeoutMs,
    },
  );

  return response.data?.appointment || response.data?.data || null;
};

export const updateAppointmentPaymentStatus = async (
  appointmentId,
  paymentStatus,
) => {
  const appointmentServiceUrl = getAppointmentServiceUrl();
  const timeoutMs = getAppointmentServiceTimeoutMs();

  const response = await axios.patch(
    `${appointmentServiceUrl}/api/appointments/${appointmentId}/payment-status`,
    { paymentStatus },
    {
      headers: {
        "x-internal-token": process.env.INTERNAL_SERVICE_TOKEN,
        "x-user-role": "admin",
      },
      timeout: timeoutMs,
    },
  );

  return response.data?.appointment || response.data?.data || null;
};
