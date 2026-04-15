import axios from "@/api/axios";

/**
 * Creates a prescription for a specific appointment.
 * @param {string} appointmentId - The ID of the appointment
 * @param {Object} payload - The prescription payload (diagnosis, medications, advice, followUpDate, status)
 * @returns {Promise}
 */
export const createDoctorPrescription = (appointmentId, payload) => {
  return axios.post(`/doctor-prescriptions/appointment/${appointmentId}`, payload);
};

/**
 * Fetches the prescription for a specific appointment.
 * @param {string} appointmentId - The ID of the appointment
 * @returns {Promise}
 */
export const getDoctorPrescriptionByAppointmentId = (appointmentId) => {
  return axios.get(`/doctor-prescriptions/appointment/${appointmentId}`);
};

/**
 * Lists all prescriptions created by the currently logged-in doctor.
 * @param {Object} params - Query parameters (e.g., { status: 'finalized' })
 * @returns {Promise}
 */
export const getMyDoctorPrescriptions = (params = {}) => {
  return axios.get("/doctor-prescriptions/me", { params });
};

/**
 * Lists all prescriptions belonging to the currently logged-in patient.
 * @param {Object} params - Query parameters (e.g., { status: 'finalized' })
 * @returns {Promise}
 */
export const getMyPatientPrescriptions = (params = {}) => {
  return axios.get("/doctor-prescriptions/patient/me", { params });
};
