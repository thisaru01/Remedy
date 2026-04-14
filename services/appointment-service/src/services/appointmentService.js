import mongoose from "mongoose";
import axios from "axios";
import Appointment from "../models/appointmentModel.js";
import { fetchUserByIdInternal } from "../clients/authClient.js";
import { sendAppointmentConfirmationEmail } from "../clients/notificationClient.js";

const DOCTOR_SERVICE_BASE_URL =
  process.env.DOCTOR_SERVICE_URL || "http://doctor-service:5000";

const ensureScheduleIsBookable = async (scheduleId) => {
  try {
    const response = await axios.get(
      `${DOCTOR_SERVICE_BASE_URL}/api/doctor-schedules/schedule/${scheduleId}`,
    );

    const schedule = response.data?.schedule || response.data;

    if (!schedule) {
      const err = new Error("Schedule not found");
      err.statusCode = 404;
      throw err;
    }

    if (schedule.isAvailable !== true) {
      const err = new Error("Doctor is not available for this schedule");
      err.statusCode = 400;
      throw err;
    }

    if (schedule.slotCount <= 0) {
      const err = new Error(
        "Schedule is not available for booking (no slots remaining)",
      );
      err.statusCode = 400;
      throw err;
    }

    return schedule;
  } catch (error) {
    if (error.response?.status === 404) {
      const err = new Error("Schedule not found");
      err.statusCode = 404;
      throw err;
    }

    if (error.statusCode) {
      throw error;
    }

    const err = new Error("Failed to verify schedule availability");
    err.statusCode = 502;
    throw err;
  }
};

const updateScheduleSlotCountFromAppointment = async (
  scheduleId,
  newSlotCount,
) => {
  if (!Number.isInteger(newSlotCount) || newSlotCount < 0 || newSlotCount > 6) {
    return;
  }

  try {
    await axios.patch(
      `${DOCTOR_SERVICE_BASE_URL}/api/doctor-schedules/internal/${scheduleId}/slot-count`,
      { slotCount: newSlotCount },
      {
        headers: {
          "x-internal-token": process.env.INTERNAL_SERVICE_TOKEN || "",
        },
      },
    );
  } catch (error) {
    // Do not fail the already-created appointment if this internal update fails.
    // Consider adding proper logging/monitoring in a real environment.
    console.error("Failed to update schedule slotCount from appointment", {
      scheduleId,
      newSlotCount,
      error: error?.message,
    });
  }
};

const generateAppointmentNumber = async (scheduleId) => {
  // Use current day's appointment count for this schedule to derive a
  // sequential number (01, 02, ...), instead of relying on schedule.slotCount.
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const existingCount = await Appointment.countDocuments({
    scheduleId,
    createdAt: { $gte: startOfDay, $lt: endOfDay },
  });

  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const datePart = `${month}/${day}`;

  const numberPart = String(existingCount + 1).padStart(2, "0");

  return `APPT_${numberPart}_${datePart}`;
};

const formatScheduleTime = (schedule) => {
  if (!schedule) return undefined;
  const { day, startTime, endTime } = schedule;
  if (!day || !startTime) return undefined;
  if (endTime) {
    return `${day} ${startTime} - ${endTime}`;
  }
  return `${day} ${startTime}`;
};

const sendAppointmentNotificationsSafe = async ({ appointment, schedule }) => {
  try {
    if (!appointment) return;

    const [patientUser, doctorUser] = await Promise.all([
      fetchUserByIdInternal(String(appointment.patientId)),
      fetchUserByIdInternal(String(appointment.doctorId)),
    ]);

    const appointmentDateTime = formatScheduleTime(schedule);
    const appointmentNumber = appointment.appointmentNumber;

    if (patientUser?.email) {
      await sendAppointmentConfirmationEmail({
        to: patientUser.email,
        patientName: patientUser.name,
        doctorName: doctorUser?.name,
        appointmentDateTime,
        recipientType: "patient",
        appointmentNumber,
      });
    }

    if (doctorUser?.email) {
      await sendAppointmentConfirmationEmail({
        to: doctorUser.email,
        patientName: patientUser?.name,
        doctorName: doctorUser.name,
        appointmentDateTime,
        recipientType: "doctor",
        appointmentNumber,
      });
    }
  } catch (error) {
    console.error("Failed to send appointment notifications", {
      appointmentId: appointment?._id,
      error: error?.message,
    });
  }
};

export const createAppointment = async (data) => {
  const { patientId, doctorId, scheduleId, status, paymentStatus, reportIds } =
    data;

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

  const schedule = await ensureScheduleIsBookable(scheduleId);
  const appointmentNumber = await generateAppointmentNumber(scheduleId);
  const appointment = await Appointment.create({
    patientId,
    doctorId,
    scheduleId,
    appointmentNumber,
    status: status || undefined,
    // let model default paymentStatus when not provided
    paymentStatus: paymentStatus || undefined,
    reportIds: Array.isArray(reportIds) ? reportIds : undefined,
  });

  // Decrement the schedule's remaining slots after a successful appointment creation.
  await updateScheduleSlotCountFromAppointment(
    scheduleId,
    (schedule.slotCount ?? 0) - 1,
  );

  // Fire-and-forget notifications; do not block appointment creation on email failures
  // or notification latency (e.g., Gmail) from impacting API response time.
  void sendAppointmentNotificationsSafe({ appointment, schedule });

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

  // When a pending appointment is rejected by the doctor, increase the
  // schedule's remaining slot count by 1.
  if (appointment.scheduleId) {
    try {
      const response = await axios.get(
        `${DOCTOR_SERVICE_BASE_URL}/api/doctor-schedules/schedule/${appointment.scheduleId}`,
      );

      const schedule = response.data?.schedule || response.data;
      if (schedule && Number.isInteger(schedule.slotCount)) {
        await updateScheduleSlotCountFromAppointment(
          appointment.scheduleId,
          schedule.slotCount + 1,
        );
      }
    } catch (error) {
      // Do not fail the rejection if this internal update fails.
      console.error("Failed to increase schedule slotCount on rejection", {
        scheduleId: appointment.scheduleId,
        error: error?.message,
      });
    }
  }

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

  // When a pending appointment is cancelled, increase the schedule's
  // remaining slot count by 1.
  if (appointment.scheduleId) {
    try {
      const response = await axios.get(
        `${DOCTOR_SERVICE_BASE_URL}/api/doctor-schedules/schedule/${appointment.scheduleId}`,
      );

      const schedule = response.data?.schedule || response.data;
      if (schedule && Number.isInteger(schedule.slotCount)) {
        await updateScheduleSlotCountFromAppointment(
          appointment.scheduleId,
          schedule.slotCount + 1,
        );
      }
    } catch (error) {
      // Do not fail the cancellation if this internal update fails.
      console.error("Failed to increase schedule slotCount on cancellation", {
        scheduleId: appointment.scheduleId,
        error: error?.message,
      });
    }
  }

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

export const updatePaymentStatus = async (id, requester, paymentStatus) => {
  if (!requester) {
    const err = new Error("Not authorized");
    err.statusCode = 401;
    throw err;
  }

  // Only patients and admins may update payment status via API
  if (requester.role !== "patient" && requester.role !== "admin") {
    const err = new Error("Only patients or admins can update payment status");
    err.statusCode = 403;
    throw err;
  }

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    const err = new Error("Appointment not found");
    err.statusCode = 404;
    throw err;
  }

  // If patient requester, ensure they own the appointment
  if (requester.role === "patient") {
    const userId = requester.id;
    const isPatientOwner =
      appointment.patientId && appointment.patientId.toString() === userId;
    if (!isPatientOwner) {
      const err = new Error(
        "You can only update payment for your own appointments",
      );
      err.statusCode = 403;
      throw err;
    }
  }

  const allowed = ["pending", "success", "failed"];
  if (!allowed.includes(paymentStatus)) {
    const err = new Error(
      `paymentStatus must be one of: ${allowed.join(", ")}`,
    );
    err.statusCode = 400;
    throw err;
  }

  // Business rule: payment can be marked success or failed only when appointment is accepted
  if (
    ["success", "failed"].includes(paymentStatus) &&
    appointment.status !== "accepted"
  ) {
    const err = new Error(
      "Payment can be 'success' or 'failed' only for accepted appointments",
    );
    err.statusCode = 400;
    throw err;
  }

  appointment.paymentStatus = paymentStatus;
  await appointment.save();

  return appointment;
};

export const completeAppointment = async (id, requester) => {
  if (!requester || requester.role !== "doctor") {
    const err = new Error("Only doctors can mark appointments as completed");
    err.statusCode = 403;
    throw err;
  }

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    const err = new Error("Appointment not found");
    err.statusCode = 404;
    throw err;
  }

  // ensure payment was successful before allowing completion
  if (appointment.paymentStatus !== "success") {
    const err = new Error(
      "Appointment payment must be successful before completing",
    );
    err.statusCode = 400;
    throw err;
  }

  const userId = requester.id;
  const isDoctorOwner =
    appointment.doctorId && appointment.doctorId.toString() === userId;

  if (!isDoctorOwner) {
    const err = new Error("You can only complete your own appointments");
    err.statusCode = 403;
    throw err;
  }

  if (appointment.status !== "accepted") {
    const err = new Error("Only accepted appointments can be marked completed");
    err.statusCode = 400;
    throw err;
  }

  appointment.status = "completed";
  await appointment.save();

  return appointment;
};

export const deleteAppointment = async (id, requester) => {
  if (!requester || requester.role !== "patient") {
    const err = new Error("Only patients can delete appointments");
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
    const err = new Error("You can only delete your own appointments");
    err.statusCode = 403;
    throw err;
  }

  const allowed = ["pending", "rejected", "cancelled"];
  if (!allowed.includes(appointment.status)) {
    const err = new Error(
      "Only appointments in pending, rejected, or cancelled status can be deleted",
    );
    err.statusCode = 400;
    throw err;
  }

  // delete and return deleted doc
  const deleted = await Appointment.findByIdAndDelete(id);
  return deleted;
};

export default {
  createAppointment,
  getAppointments,
  getAppointmentById,
  acceptAppointment,
  rejectAppointment,
  cancelAppointment,
  rescheduleAppointment,
  updatePaymentStatus,
  completeAppointment,
  deleteAppointment,
};
