import axios from "@/api/axios";

export const getUsers = ({ status, role } = {}) => {
  // Admin-only: GET /api/auth/users?status=active|inactive&role=patient|doctor|admin
  return axios.get("/auth/users", {
    params: {
      ...(status ? { status } : {}),
      ...(role ? { role } : {}),
    },
  });
};

export const updateUserStatus = ({ userId, status }) => {
  // Admin-only: PATCH /api/auth/users/:userId/status { status }
  return axios.patch(`/auth/users/${userId}/status`, { status });
};
