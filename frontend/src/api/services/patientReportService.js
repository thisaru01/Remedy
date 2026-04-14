import axios from "@/api/axios";

// Get all reports for the authenticated patient
export const getMyPatientReports = () => {
  return axios.get("/patient-reports");
};

// Upload a new patient report (general or linked to an appointment)
// `formData` should include: report (File), title (string), optional description, optional appointmentId
export const uploadPatientReport = (formData) => {
  return axios.post("/patient-reports", formData);
};

// Update an existing patient report's metadata (title, description, appointmentId)
export const updatePatientReport = (id, payload) => {
  return axios.put(`/patient-reports/${id}`, payload);
};

// Delete a patient report
export const deletePatientReport = (id) => {
  return axios.delete(`/patient-reports/${id}`);
};
