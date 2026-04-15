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

  try {
    const response = await axios.get(
      `${appointmentServiceUrl}/api/appointments/${appointmentId}`,
      {
        headers,
        timeout: timeoutMs,
      },
    );

    return response.data?.appointment || response.data?.data || null;
  } catch (error) {
    console.error("Appointment service error:", error.message);
    throw error;
  }
};

export const updateAppointmentPaymentStatus = async (
  appointmentId,
  paymentStatus,
) => {
  const appointmentServiceUrl = getAppointmentServiceUrl();
  const timeoutMs = getAppointmentServiceTimeoutMs();

  try {
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
  } catch (error) {
    console.error("Appointment service error:", error.message);
    throw error;
  }
};

const EVENT_STATUS_MAP = {
  PAYMENT_PENDING: "pending",
  PAYMENT_SUCCESS: "success",
  PAYMENT_FAILED: "failed",
};

export const emitAppointmentEvent = async (event, appointmentId) => {
  const paymentStatus = EVENT_STATUS_MAP[event];
  if (!paymentStatus) {
    console.error(`Unknown payment event: ${event}`);
    return;
  }

  await updateAppointmentPaymentStatus(appointmentId, paymentStatus);
};
