import mongoose from "mongoose";
import Appointment from "../models/appointmentModel.js";

export const createAppointment = async (data) => {
  const {
    patientId,
    doctorId,
    appointmentNumber,
    scheduleId,
    status,
    paymentStatus,
    reportIds,
  } = data;

  // Basic required validations
  if (!patientId) {
    const err = new Error("patientId is required");
    err.statusCode = 400;
    throw err;
  }
  if (!doctorId) {
    const err = new Error("doctorId is required");
    err.statusCode = 400;
    throw err;
  }
  if (!scheduleId) {
    const err = new Error("scheduleId is required");
    err.statusCode = 400;
    throw err;
  }
  // appointmentNumber may be provided; if not, generate an atomic incremental value
  let finalAppointmentNumber = appointmentNumber;

  if (!finalAppointmentNumber) {
    const counters = mongoose.connection.collection("counters");
    const res = await counters.findOneAndUpdate(
      { _id: "appointmentNumber" },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" },
    );
    const seq = res.value && res.value.seq ? res.value.seq : 1;
    finalAppointmentNumber = `APPT-${String(seq).padStart(6, "0")}`;
  } else {
    // if client provided appointmentNumber, ensure uniqueness
    const existing = await Appointment.findOne({ appointmentNumber: finalAppointmentNumber });
    if (existing) {
      const err = new Error("appointmentNumber already exists");
      err.statusCode = 409;
      throw err;
    }
  }

  const appointment = await Appointment.create({
    patientId,
    doctorId,
    scheduleId,
    appointmentNumber: finalAppointmentNumber,
    status: status || undefined,
    // let model default paymentStatus when not provided
    paymentStatus: paymentStatus || undefined,
    reportIds: Array.isArray(reportIds) ? reportIds : undefined,
  });

  return appointment;
};

export const getAppointments = async (filter = {}) => {
  return Appointment.find(filter).sort({ createdAt: -1 });
};

export const getAppointmentById = async (id, requester) => {
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    const err = new Error("Appointment not found");
    err.statusCode = 404;
    throw err;
  }

  if (!requester) {
    const err = new Error("Not authorized");
    err.statusCode = 401;
    throw err;
  }

  const { id: userId, role } = requester;

  const isPatientOwner =
    role === "patient" && appointment.patientId?.toString() === userId;
  const isDoctorOwner =
    role === "doctor" && appointment.doctorId?.toString() === userId;
  const isAdmin = role === "admin";

  if (!isPatientOwner && !isDoctorOwner && !isAdmin) {
    const err = new Error("You are not allowed to view this appointment");
    err.statusCode = 403;
    throw err;
  }

  return appointment;
};

export const acceptAppointment = async (id, requester) => {
  if (!requester || requester.role !== "doctor") {
    const err = new Error("Only doctors can accept appointments");
    err.statusCode = 403;
    throw err;
  }

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    const err = new Error("Appointment not found");
    err.statusCode = 404;
    throw err;
  }

  const userId = requester.id;
  const isDoctorOwner =
    appointment.doctorId && appointment.doctorId.toString() === userId;

  if (!isDoctorOwner) {
    const err = new Error("You can only accept your own appointments");
    err.statusCode = 403;
    throw err;
  }

  if (appointment.status === "accepted") {
    const err = new Error("Appointment is already accepted");
    err.statusCode = 400;
    throw err;
  }

  if (appointment.status === "rejected") {
    const err = new Error("Rejected appointments cannot be accepted again");
    err.statusCode = 400;
    throw err;
  }

  appointment.status = "accepted";
  await appointment.save();

  return appointment;
};

export const rejectAppointment = async (id, requester) => {
  if (!requester || requester.role !== "doctor") {
    const err = new Error("Only doctors can reject appointments");
    err.statusCode = 403;
    throw err;
  }

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    const err = new Error("Appointment not found");
    err.statusCode = 404;
    throw err;
  }

  const userId = requester.id;
  const isDoctorOwner =
    appointment.doctorId && appointment.doctorId.toString() === userId;

  if (!isDoctorOwner) {
    const err = new Error("You can only reject your own appointments");
    err.statusCode = 403;
    throw err;
  }

  if (appointment.status === "rejected") {
    const err = new Error("Appointment is already rejected");
    err.statusCode = 400;
    throw err;
  }

  if (appointment.status === "accepted") {
    const err = new Error("Accepted appointments cannot be rejected again");
    err.statusCode = 400;
    throw err;
  }

  appointment.status = "rejected";
  await appointment.save();

  return appointment;
};

export const cancelAppointment = async (id, requester) => {
  if (!requester || requester.role !== "patient") {
    const err = new Error("Only patients can cancel appointments");
    err.statusCode = 403;
    throw err;
  }

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    const err = new Error("Appointment not found");
    err.statusCode = 404;
    throw err;
  }

  const userId = requester.id;
  const isPatientOwner =
    appointment.patientId && appointment.patientId.toString() === userId;

  if (!isPatientOwner) {
    const err = new Error("You can only cancel your own appointments");
    err.statusCode = 403;
    throw err;
  }

  if (appointment.status !== "pending") {
    const err = new Error(
      "Only appointments in pending status can be cancelled",
    );
    err.statusCode = 400;
    throw err;
  }

  appointment.status = "cancelled";
  await appointment.save();

  return appointment;
};

export const rescheduleAppointment = async (id, requester, data) => {
  if (!requester || requester.role !== "patient") {
    const err = new Error("Only patients can change appointment schedule");
    err.statusCode = 403;
    throw err;
  }

  const { scheduleId } = data || {};
  if (!scheduleId) {
    const err = new Error("scheduleId is required to reschedule");
    err.statusCode = 400;
    throw err;
  }

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    const err = new Error("Appointment not found");
    err.statusCode = 404;
    throw err;
  }

  const userId = requester.id;
  const isPatientOwner =
    appointment.patientId && appointment.patientId.toString() === userId;

  if (!isPatientOwner) {
    const err = new Error("You can only change your own appointments");
    err.statusCode = 403;
    throw err;
  }

  if (appointment.status !== "pending") {
    const err = new Error(
      "Only appointments in pending status can be rescheduled",
    );
    err.statusCode = 400;
    throw err;
  }

  appointment.scheduleId = scheduleId;
  await appointment.save();

  return appointment;
};

export default {
  createAppointment,
  getAppointments,
  getAppointmentById,
  acceptAppointment,
  rejectAppointment,
  cancelAppointment,
  rescheduleAppointment,
};
