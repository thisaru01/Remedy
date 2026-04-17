import axios from "@/api/axios";

export const getMe = () => {
  // Uses gateway auth routes: GET /api/auth/me
  return axios.get("/auth/me");
};

export const updateMe = (data) => {
  // Uses gateway auth routes: PUT /api/auth/me
  return axios.put("/auth/me", data);
};
