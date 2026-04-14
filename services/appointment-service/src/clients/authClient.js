import axios from "axios";

const DEFAULT_AUTH_SERVICE_URL = "http://auth-service:5000";
const DEFAULT_AUTH_TIMEOUT_MS = 3000;

const getAuthServiceUrl = () => {
  return (process.env.AUTH_SERVICE_URL || DEFAULT_AUTH_SERVICE_URL).trim();
};

const getAuthServiceTimeoutMs = () => {
  const rawValue = (process.env.AUTH_SERVICE_TIMEOUT_MS || "").trim();
  if (!rawValue) return DEFAULT_AUTH_TIMEOUT_MS;

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_AUTH_TIMEOUT_MS;
  }

  return parsed;
};

export const fetchUserByIdInternal = async (userId) => {
  if (!userId) return null;

  const authServiceUrl = getAuthServiceUrl();
  const timeoutMs = getAuthServiceTimeoutMs();

  const response = await axios.get(
    `${authServiceUrl}/api/auth/internal/users/${userId}`,
    {
      headers: {
        "x-internal-token": process.env.INTERNAL_SERVICE_TOKEN,
      },
      timeout: timeoutMs,
    },
  );

  return response.data?.user || null;
};
