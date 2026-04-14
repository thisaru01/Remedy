import axios from "@/api/axios";

/**
 * Fetches doctor profiles filtered by verification status.
 * @param {string} verificationStatus - 'not_submitted' | 'submitted' | 'approved' | 'rejected'
 * @returns {Promise}
 */
export const getDoctorsByStatus = (verificationStatus) => {
  return axios.get(`/doctor-profiles?verificationStatus=${verificationStatus}`);
};

/**
 * Approves a doctor's verification request.
 * @param {string} doctorUserId - The ID of the doctor user.
 * @returns {Promise}
 */
export const approveDoctorVerification = (doctorUserId) => {
  return axios.patch(`/doctor-profiles/${doctorUserId}/verification/approve`);
};

/**
 * Rejects a doctor's verification request.
 * @param {string} doctorUserId - The ID of the doctor user.
 * @returns {Promise}
 */
export const rejectDoctorVerification = (doctorUserId) => {
  return axios.patch(`/doctor-profiles/${doctorUserId}/verification/reject`);
};

/**
 * Fetches a list of all users by role.
 * @param {string} role - 'doctor' | 'patient'
 * @returns {Promise}
 */
export const getUsersByRole = (role) => {
  // Assuming a generic endpoint might exist or we use the specific ones
  if (role === 'doctor') return axios.get("/doctor-profiles");
  // Patients might need a separate service or endpoint
  return axios.get(`/users/role/${role}`);
};
