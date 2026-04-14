import axios from "@/api/axios";

export const getAppointments = (params) => {
  return axios.get("/appointments", { params });
};

export const getAppointment = (id) => {
  return axios.get(`/appointments/${id}`);
};

export const cancelAppointment = (id) => {
  return axios.patch(`/appointments/${id}/cancel`);
};

export const deleteAppointment = (id) => {
  return axios.delete(`/appointments/${id}`);
};
