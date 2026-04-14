import axios from "@/api/axios";

export const getSchedule = (scheduleId) => {
  return axios.get(`/doctor-schedules/schedule/${scheduleId}`);
};

export const getSchedulesByDoctor = (doctorId) => {
  return axios.get(`/doctor-schedules/${doctorId}`);
};
