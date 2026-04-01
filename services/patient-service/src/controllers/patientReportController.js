import {
  uploadPatientReportService,
  getMyPatientReportsService,
  getReportsForAppointmentService,
  deletePatientReportService,
  updatePatientReportService,
} from "../services/patientReportService.js";

import {
  grantDoctorAccessToPatientReportService,
  getSharedWithMePatientReportsService,
  getPatientReportByIdService,
  revokeDoctorAccessToPatientReportService,
} from "../services/patientReportSharingService.js";

// Upload a new patient report for the authenticated patient
export const uploadPatientReport = async (req, res) => {
  const { status, body } = await uploadPatientReportService({
    user: req.user,
    file: req.file,
    body: req.body,
  });
  return res.status(status).json(body);
};

// Get all reports for the authenticated patient
export const getMyPatientReports = async (req, res) => {
  const { status, body } = await getMyPatientReportsService({
    user: req.user,
    query: req.query,
  });
  return res.status(status).json(body);
};

// Grant or update a doctor's access to a specific report
export const grantDoctorAccessToPatientReport = async (req, res) => {
  const { status, body } = await grantDoctorAccessToPatientReportService({
    user: req.user,
    params: req.params,
    body: req.body,
  });
  return res.status(status).json(body);
};

// Get all reports that are shared with the authenticated doctor
export const getSharedWithMePatientReports = async (req, res) => {
  const { status, body } = await getSharedWithMePatientReportsService(req.user);
  return res.status(status).json(body);
};

// Get all reports linked to a specific appointment, validating caller access
export const getReportsForAppointment = async (req, res) => {
  const { status, body } = await getReportsForAppointmentService({
    user: req.user,
    params: req.params,
  });
  return res.status(status).json(body);
};

// Get a single report if the caller has access
export const getPatientReportById = async (req, res) => {
  const { status, body } = await getPatientReportByIdService({
    user: req.user,
    params: req.params,
  });
  return res.status(status).json(body);
};

// Revoke a doctor's access to a specific report
export const revokeDoctorAccessToPatientReport = async (req, res) => {
  const { status, body } = await revokeDoctorAccessToPatientReportService({
    user: req.user,
    params: req.params,
  });
  return res.status(status).json(body);
};

// Delete a report owned by the authenticated patient
export const deletePatientReport = async (req, res) => {
  const { status, body } = await deletePatientReportService({
    user: req.user,
    params: req.params,
  });
  return res.status(status).json(body);
};

// Update a report's metadata (title, description, appointmentId)
export const updatePatientReport = async (req, res) => {
  try {
    const { status, body } = await updatePatientReportService({
      user: req.user,
      params: req.params,
      body: req.body,
    });
    return res.status(status).json(body);
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
