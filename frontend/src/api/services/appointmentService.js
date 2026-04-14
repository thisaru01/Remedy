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

export const rescheduleAppointment = (id, scheduleId) => {
  return axios.patch(`/appointments/${id}/reschedule`, { scheduleId });
};

export const createAppointment = (data) => {
  return axios.post("/appointments", data);
};
