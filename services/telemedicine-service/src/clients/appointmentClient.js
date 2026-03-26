import axios from "axios";

const getAppointmentServiceUrl = () => {
  return process.env.APPOINTMENT_SERVICE_URL || "http://appointment-service:5000";
};

export const fetchAppointmentById = async (appointmentId) => {
  const appointmentServiceUrl = getAppointmentServiceUrl();

  const response = await axios.get(
    `${appointmentServiceUrl}/api/appointments/${appointmentId}`,
    {
      headers: {
        "x-internal-token": process.env.INTERNAL_SERVICE_TOKEN,
      },
      timeout: 3000,
    },
  );

  return response.data?.data;
};
