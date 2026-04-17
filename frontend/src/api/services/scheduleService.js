import axios from "@/api/axios";

export const getSchedule = (scheduleId) => {
  return axios.get(`/doctor-schedules/schedule/${scheduleId}`);
};

export const getSchedulesByDoctor = (doctorId) => {
  return axios.get(`/doctor-schedules/${doctorId}`);
};

export const getOwnSchedules = () => {
  return axios.get("/doctor-schedules/me");
};

export const createSchedule = (scheduleData) => {
  return axios.post("/doctor-schedules/me", scheduleData);
};

export const updateSchedule = (scheduleId, scheduleData) => {
  return axios.put(`/doctor-schedules/me/${scheduleId}`, scheduleData);
};

export const updateAvailability = (scheduleId, isAvailable) => {
  return axios.put(`/doctor-schedules/me/${scheduleId}/availability`, { isAvailable });
};
