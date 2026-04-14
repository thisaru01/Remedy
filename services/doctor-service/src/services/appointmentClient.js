import axios from "axios";

const APPOINTMENT_SERVICE_URL =
  process.env.APPOINTMENT_SERVICE_URL || "http://appointment-service:5000";

export const fetchAppointmentByIdForUser = async (appointmentId, requester) => {
  const response = await axios.get(
    `${APPOINTMENT_SERVICE_URL.replace(/\/$/, "")}/api/appointments/${appointmentId}`,
    {
      headers: {
        "x-internal-token": process.env.INTERNAL_SERVICE_TOKEN || "",
        "x-user-id": requester?.id || "",
        "x-user-role": requester?.role || "",
      },
      timeout: 8000,
    },
  );

  return response.data?.appointment || null;
};
