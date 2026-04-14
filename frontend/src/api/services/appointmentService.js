import axios from "@/api/axios";

export const getAppointments = (params) => {
  return axios.get("/appointments", { params });
};

export const getAppointment = (id) => {
  return axios.get(`/appointments/${id}`);
};
