import axios from "@/api/axios";

/**
 * Fetches doctor profiles by verification status.
 * @param {string} status - submitted, approved, rejected
 */
export const getDoctorsByStatus = (status) => {
  return axios.get(`/doctor-profiles?verificationStatus=${status}`);
};

/**
 * Fetches all doctor profiles (regardless of status).
 */
export const getAllDoctorProfiles = () => {
  return axios.get("/doctor-profiles");
};

/**
 * Approves a doctor's professional verification.
 */
export const approveDoctorVerification = (id) => {
  return axios.patch(`/doctor-profiles/${id}/verification/approve`);
};

/**
 * Rejects a doctor's professional verification.
 */
export const rejectDoctorVerification = (id) => {
  return axios.patch(`/doctor-profiles/${id}/verification/reject`);
};
