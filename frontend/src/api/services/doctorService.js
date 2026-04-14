import axios from "@/api/axios";

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
