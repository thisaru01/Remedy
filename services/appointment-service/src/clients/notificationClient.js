import axios from "axios";

const DEFAULT_NOTIFICATION_SERVICE_URL = "http://notification-service:5007";
const DEFAULT_NOTIFICATION_TIMEOUT_MS = 3000;

const getNotificationServiceUrl = () => {
  return (
    process.env.NOTIFICATION_SERVICE_URL || DEFAULT_NOTIFICATION_SERVICE_URL
  ).trim();
};

const getNotificationServiceTimeoutMs = () => {
  const rawValue = (process.env.NOTIFICATION_SERVICE_TIMEOUT_MS || "").trim();
  if (!rawValue) return DEFAULT_NOTIFICATION_TIMEOUT_MS;

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_NOTIFICATION_TIMEOUT_MS;
  }

  return parsed;
};

export const sendAppointmentConfirmationEmail = async ({
  to,
  patientName,
  doctorName,
  appointmentDateTime,
  recipientType,
  appointmentNumber,
}) => {
  if (!to) return;

  const notificationServiceUrl = getNotificationServiceUrl();
  const timeoutMs = getNotificationServiceTimeoutMs();

  await axios.post(
    `${notificationServiceUrl}/api/notifications/email/appointment-confirmation`,
    {
      to,
      recipientType,
      patientName,
      doctorName,
      appointmentDateTime,
      appointmentNumber,
    },
    {
      headers: {
        "x-internal-token": process.env.INTERNAL_SERVICE_TOKEN,
      },
      timeout: timeoutMs,
    },
  );
};
