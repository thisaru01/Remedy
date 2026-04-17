import axios from "axios";

const DEFAULT_DOCTOR_SERVICE_URL = "http://doctor-service:5000";
const DEFAULT_DOCTOR_TIMEOUT_MS = 3000;

const getDoctorServiceUrl = () => {
  return (process.env.DOCTOR_SERVICE_URL || DEFAULT_DOCTOR_SERVICE_URL).trim();
};

const getDoctorServiceTimeoutMs = () => {
  const rawValue = (process.env.DOCTOR_SERVICE_TIMEOUT_MS || "").trim();
  if (!rawValue) return DEFAULT_DOCTOR_TIMEOUT_MS;

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_DOCTOR_TIMEOUT_MS;
  }

  return parsed;
};

export const fetchDoctorProfileByUserIdInternal = async (userId) => {
  if (!userId) return null;

  const doctorServiceUrl = getDoctorServiceUrl();
  const timeoutMs = getDoctorServiceTimeoutMs();
  try {
    const response = await axios.get(
      `${doctorServiceUrl}/api/doctor-profiles/details/${userId}`,
      {
        headers: {
          "x-internal-token": process.env.INTERNAL_SERVICE_TOKEN,
        },
        timeout: timeoutMs,
      },
    );

    return response.data?.profile || response.data || null;
  } catch (error) {
    if (error.response?.status === 404) {
      // No profile yet for this doctor; treat as no phone available
      return null;
    }
    throw error;
  }
};
