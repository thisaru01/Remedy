import axios from "@/api/axios";

// Get the authenticated patient's profile
export const getMyPatientProfile = () => {
  return axios.get("/patient-profiles/me");
};

// Update the authenticated patient's profile
export const updateMyPatientProfile = (data) => {
  return axios.put("/patient-profiles/me", data);
};
