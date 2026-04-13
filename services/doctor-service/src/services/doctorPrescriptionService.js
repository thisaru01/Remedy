import mongoose from "mongoose";

import DoctorPrescription from "../models/doctorPrescriptionModel.js";
import { fetchAppointmentByIdForUser } from "./appointmentClient.js";

const allowedStatuses = ["draft", "finalized"];
const updatableFields = ["diagnosis", "medications", "advice", "followUpDate"];

const createServiceError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureDoctorRole = (user, action) => {
  if (!user?.id) {
    throw createServiceError(400, "Authenticated user id is required");
  }

  if (user.role !== "doctor") {
    throw createServiceError(403, `Only doctors can ${action}`);
  }
};

const ensureObjectId = (value, fieldName) => {
  if (!value) {
    throw createServiceError(400, `${fieldName} is required`);
  }

  if (!mongoose.isValidObjectId(value)) {
    throw createServiceError(400, `${fieldName} must be a valid ObjectId`);
  }
};

const normalizeFollowUpDate = (followUpDate) => {
  if (followUpDate === undefined) return undefined;
  if (followUpDate === null || followUpDate === "") return null;

  const parsed = new Date(followUpDate);
  if (Number.isNaN(parsed.getTime())) {
    throw createServiceError(400, "followUpDate must be a valid date");
  }

  return parsed;
};

const normalizeMedications = (medications) => {
  if (medications === undefined) return undefined;
  if (!Array.isArray(medications)) {
    throw createServiceError(400, "medications must be an array");
  }

  const normalized = medications.map((medication, index) => {
    const { name, dosage, frequency, duration, route, notes } = medication || {};

    if (!name || !dosage || !frequency || !duration) {
      throw createServiceError(
        400,
        `medications[${index}] must include name, dosage, frequency, and duration`,
      );
    }

    return {
      name: String(name).trim(),
      dosage: String(dosage).trim(),
      frequency: String(frequency).trim(),
      duration: String(duration).trim(),
      ...(route !== undefined ? { route: String(route).trim() } : {}),
      ...(notes !== undefined ? { notes: String(notes).trim() } : {}),
    };
  });

  return normalized;
};

const ensureFinalizedContent = ({ diagnosis, medications }) => {
  if (!diagnosis || !String(diagnosis).trim()) {
    throw createServiceError(400, "diagnosis is required when finalizing a prescription");
  }

  if (!Array.isArray(medications) || medications.length === 0) {
    throw createServiceError(400, "At least one medication is required when finalizing");
  }
};

const ensureAppointmentEligibility = async ({ appointmentId, requester }) => {
  let appointment;
  try {
    appointment = await fetchAppointmentByIdForUser(appointmentId, requester);
  } catch (error) {
    const status = error?.response?.status;
    if (status === 404) {
      throw createServiceError(404, "Appointment not found");
    }
    if (status === 403) {
      throw createServiceError(403, "You can only issue prescriptions for your own appointments");
    }
    throw createServiceError(502, "Failed to verify appointment");
  }

  if (!appointment) {
    throw createServiceError(404, "Appointment not found");
  }

  if (!["accepted", "completed"].includes(appointment.status)) {
    throw createServiceError(400, "Prescription can only be issued for accepted or completed appointments");
  }

  return appointment;
};

export const createPrescriptionForAppointment = async ({ requester, appointmentId, payload }) => {
  ensureDoctorRole(requester, "create prescriptions");
  ensureObjectId(appointmentId, "appointmentId");

  const existing = await DoctorPrescription.findOne({ appointmentId });
  if (existing) {
    throw createServiceError(409, "A prescription already exists for this appointment");
  }

  const appointment = await ensureAppointmentEligibility({ appointmentId, requester });

  const status = payload?.status || "draft";
  if (!allowedStatuses.includes(status)) {
    throw createServiceError(400, "status must be draft or finalized");
  }

  const medications = normalizeMedications(payload?.medications);
  const diagnosis = payload?.diagnosis;
  const advice = payload?.advice;
  const followUpDate = normalizeFollowUpDate(payload?.followUpDate);

  if (status === "finalized") {
    ensureFinalizedContent({ diagnosis, medications: medications || [] });
  }

  const prescription = await DoctorPrescription.create({
    appointmentId,
    doctorUserId: requester.id,
    patientUserId: appointment.patientId,
    ...(diagnosis !== undefined ? { diagnosis: String(diagnosis).trim() } : {}),
    ...(medications !== undefined ? { medications } : {}),
    ...(advice !== undefined ? { advice: String(advice).trim() } : {}),
    ...(followUpDate !== undefined ? { followUpDate } : {}),
    status,
    issuedAt: status === "finalized" ? new Date() : null,
  });

  return prescription;
};

export const listOwnDoctorPrescriptions = async ({ requester, query = {} }) => {
  ensureDoctorRole(requester, "view prescriptions");

  const filter = { doctorUserId: requester.id };
  if (query?.status) {
    if (!allowedStatuses.includes(query.status)) {
      throw createServiceError(400, "status filter must be draft or finalized");
    }
    filter.status = query.status;
  }

  return DoctorPrescription.find(filter).sort({ createdAt: -1 });
};

export const getPrescriptionById = async ({ requester, prescriptionId }) => {
  if (!requester?.id || !requester?.role) {
    throw createServiceError(400, "Authenticated user context is required");
  }

  ensureObjectId(prescriptionId, "prescriptionId");

  const prescription = await DoctorPrescription.findById(prescriptionId);
  if (!prescription) {
    throw createServiceError(404, "Prescription not found");
  }

  if (
    requester.role !== "admin" &&
    (requester.role !== "doctor" || String(prescription.doctorUserId) !== String(requester.id))
  ) {
    throw createServiceError(403, "Access denied");
  }

  return prescription;
};

export const getPrescriptionByAppointmentId = async ({ requester, appointmentId }) => {
  ensureDoctorRole(requester, "view prescriptions");
  ensureObjectId(appointmentId, "appointmentId");

  const prescription = await DoctorPrescription.findOne({ appointmentId });
  if (!prescription) {
    throw createServiceError(404, "Prescription not found");
  }

  if (String(prescription.doctorUserId) !== String(requester.id)) {
    throw createServiceError(403, "Access denied");
  }

  return prescription;
};

export const updateDraftPrescription = async ({ requester, prescriptionId, payload }) => {
  ensureDoctorRole(requester, "update prescriptions");
  ensureObjectId(prescriptionId, "prescriptionId");

  const prescription = await DoctorPrescription.findById(prescriptionId);
  if (!prescription) {
    throw createServiceError(404, "Prescription not found");
  }

  if (String(prescription.doctorUserId) !== String(requester.id)) {
    throw createServiceError(403, "Access denied");
  }

  if (prescription.status !== "draft") {
    throw createServiceError(400, "Only draft prescriptions can be updated");
  }

  const update = {};

  if (payload?.diagnosis !== undefined) {
    update.diagnosis = String(payload.diagnosis).trim();
  }

  if (payload?.advice !== undefined) {
    update.advice = String(payload.advice).trim();
  }

  if (payload?.medications !== undefined) {
    update.medications = normalizeMedications(payload.medications);
  }

  if (payload?.followUpDate !== undefined) {
    update.followUpDate = normalizeFollowUpDate(payload.followUpDate);
  }

  const hasUpdatableField = Object.keys(update).some((key) => updatableFields.includes(key));
  if (!hasUpdatableField) {
    throw createServiceError(400, "No valid fields provided to update");
  }

  Object.assign(prescription, update);
  await prescription.save();

  return prescription;
};

export const finalizePrescription = async ({ requester, prescriptionId }) => {
  ensureDoctorRole(requester, "finalize prescriptions");
  ensureObjectId(prescriptionId, "prescriptionId");

  const prescription = await DoctorPrescription.findById(prescriptionId);
  if (!prescription) {
    throw createServiceError(404, "Prescription not found");
  }

  if (String(prescription.doctorUserId) !== String(requester.id)) {
    throw createServiceError(403, "Access denied");
  }

  if (prescription.status === "finalized") {
    throw createServiceError(400, "Prescription is already finalized");
  }

  ensureFinalizedContent({
    diagnosis: prescription.diagnosis,
    medications: prescription.medications,
  });

  prescription.status = "finalized";
  prescription.issuedAt = new Date();
  await prescription.save();

  return prescription;
};
