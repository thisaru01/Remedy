import axios from "axios";

const DEFAULT_PATIENT_SERVICE_URL = "http://patient-service:5000";
const DEFAULT_PATIENT_TIMEOUT_MS = 3000;

const getPatientServiceUrl = () => {
  return (
    process.env.PATIENT_SERVICE_URL || DEFAULT_PATIENT_SERVICE_URL
  ).trim();
};

const getPatientServiceTimeoutMs = () => {
  const rawValue = (process.env.PATIENT_SERVICE_TIMEOUT_MS || "").trim();
  if (!rawValue) return DEFAULT_PATIENT_TIMEOUT_MS;

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_PATIENT_TIMEOUT_MS;
  }

  return parsed;
};

export const fetchPatientProfileByUserIdInternal = async (userId) => {
  if (!userId) return null;

  const patientServiceUrl = getPatientServiceUrl();
  const timeoutMs = getPatientServiceTimeoutMs();
  try {
    const response = await axios.get(
      `${patientServiceUrl}/api/patient-profiles/${userId}`,
      {
        headers: {
          "x-internal-token": process.env.INTERNAL_SERVICE_TOKEN,
          // Grant doctor/admin-style access for this internal lookup so
          // patient-service will return the profile if it exists.
          "x-user-role": "admin",
          "x-user-id": String(userId),
        },
        timeout: timeoutMs,
      },
    );
    console.log("hutto");

    return response.data?.profile || response.data || null;
  } catch (error) {
    if (error.response?.status === 404) {
      // No profile yet for this user; treat as no phone available
      return null;
    }
    throw error;
  }
};
