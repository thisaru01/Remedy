import axios from "axios";

const DEFAULT_AUTH_SERVICE_URL = "http://auth-service:5000";
const DEFAULT_AUTH_TIMEOUT_MS = 3000;

const getAuthServiceUrl = () => {
  return (process.env.AUTH_SERVICE_URL || DEFAULT_AUTH_SERVICE_URL).trim();
};

/**
 * Fetch a user's name from the auth service internal endpoint.
 * Returns the name string, or null if unavailable / the call fails.
 */
export const fetchUserName = async (userId) => {
  if (!userId) return null;

  try {
    const authServiceUrl = getAuthServiceUrl();
    const response = await axios.get(
      `${authServiceUrl}/internal/users/${userId}`,
      {
        headers: { "x-internal-token": process.env.INTERNAL_SERVICE_TOKEN },
        timeout: DEFAULT_AUTH_TIMEOUT_MS,
      },
    );

    return response.data?.user?.name ?? response.data?.name ?? null;
  } catch {
    return null;
  }
};
