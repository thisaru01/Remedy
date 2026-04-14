import axios from "@/api/axios";

export const getDoctorDetails = (id) => {
  return axios.get(`/doctor-profiles/details/${id}`);
};
