import axios from "@/api/axios";

export const createSession = ({ appointmentId, patientId, doctorId }) => {
  return axios.post("/telemedicine/sessions", { appointmentId, patientId, doctorId });
};

export const getSessionJoinDetails = (sessionId) => {
  return axios.get(`/telemedicine/sessions/${sessionId}/join`);
};

export const getSessionByAppointmentId = (appointmentId) => {
  return axios.get(`/telemedicine/sessions/appointment/${appointmentId}`);
};
