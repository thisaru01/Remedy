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

export default { createAppointment };
