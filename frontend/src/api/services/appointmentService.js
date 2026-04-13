import axios from "@/api/axios";

export const getAppointments = (params) => {
  return axios.get("/appointments", { params });
};
