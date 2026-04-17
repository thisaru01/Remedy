import axios from "@/api/axios";

/**
 * Fetches the currently logged-in doctor's profile.
 * @returns {Promise}
 */
export const getOwnDoctorProfile = () => {
  return axios.get("/doctor-profiles/me");
};

/**
 * Updates the currently logged-in doctor's profile.
 * @param {Object} profileData - The updated profile data.
 * @returns {Promise}
 */
export const updateOwnDoctorProfile = (profileData) => {
  return axios.put("/doctor-profiles/me", profileData);
};

/**
 * Submits the verification details for the currently logged-in doctor.
 * @param {Object} verificationData - The verification details (license, etc).
 * @returns {Promise}
 */
export const submitOwnDoctorVerification = (verificationData) => {
  return axios.put("/doctor-profiles/me/verification", verificationData);
};
  
// Public: list all approved doctors
export const getApprovedDoctors = () => {
  return axios.get("/doctor-profiles/approved/public");
};

// Public: list approved doctors by specialty
export const getApprovedDoctorsBySpecialty = (specialty) => {
  return axios.get(
    `/doctor-profiles/approved/public/specialty/${encodeURIComponent(
      specialty,
    )}`,
  );
};

// Public: get doctor details
export const getDoctorDetails = (id) => {
  return axios.get(`/doctor-profiles/details/${id}`);
};

export const getScheduleById = (scheduleId) => {
  return axios.get(`/doctor-schedules/schedule/${scheduleId}`);
};
