import axios from "@/api/axios";

export const getMe = () => {
  // Uses gateway auth routes: GET /api/auth/me
  return axios.get("/auth/me");
};
