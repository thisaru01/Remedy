import Payment from "../models/paymentModel.js";
import {
  fetchAppointmentByIdForUser,
  updateAppointmentPaymentStatus,
} from "../clients/appointmentClient.js";
import { createCheckoutSession, retrieveCheckoutSession } from "../clients/stripeClient.js";

const normalizeFailureReason = (value) => {
  if (!value) {
    return "";
  }

  return String(value).trim();
};

const syncPaymentStatus = async (
  payment,
  paymentStatus,
  { failureReason = "", providerPaymentIntentId } = {},
) => {
  if (!payment) {
    const error = new Error("Payment not found");
    error.statusCode = 404;
    throw error;
  }

  payment.paymentStatus = paymentStatus;

  if (providerPaymentIntentId) {
    payment.providerPaymentIntentId = String(providerPaymentIntentId);
  }

  if (paymentStatus === "failed") {
    payment.failureReason = normalizeFailureReason(failureReason);
  } else {
    payment.failureReason = "";
  }

  await payment.save();
  await updateAppointmentPaymentStatus(payment.appointmentId, paymentStatus);

  return payment;
};

const assertPatientRequester = (requester) => {
  if (!requester || requester.role !== "patient") {
    const error = new Error("Only patients can create payments");
    error.statusCode = 403;
    throw error;
  }
};

const assertPaymentOwnership = (payment, requester) => {
  if (!requester) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    throw error;
  }

  if (requester.role === "admin") {
    return;
  }

  if (requester.role !== "patient") {
    const error = new Error("Only patients or admins can view payments");
    error.statusCode = 403;
    throw error;
  }

  if (String(payment.patientId) !== String(requester.id)) {
    const error = new Error("You can only access your own payments");
    error.statusCode = 403;
    throw error;
  }
};

export const createPayment = async ({ appointmentId, amount, currency }, requester) => {
  assertPatientRequester(requester);

  if (!appointmentId) {
    const error = new Error("appointmentId is required");
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    const error = new Error("amount must be a positive number");
    error.statusCode = 400;
    throw error;
  }

  const appointment = await fetchAppointmentByIdForUser(appointmentId, requester);
  if (!appointment) {
    const error = new Error("Appointment not found");
    error.statusCode = 404;
    throw error;
  }

  if (String(appointment.patientId) !== String(requester.id)) {
    const error = new Error("You can only pay for your own appointments");
    error.statusCode = 403;
    throw error;
  }

  if (appointment.status !== "accepted") {
    const error = new Error("Only accepted appointments can be paid");
    error.statusCode = 400;
    throw error;
  }

  const existingPayment = await Payment.findOne({ appointmentId });
  if (existingPayment && existingPayment.paymentStatus === "success") {
    const error = new Error("This appointment has already been paid");
    error.statusCode = 409;
    throw error;
  }

  const session = await createCheckoutSession({
    appointmentId,
    amount: Number(amount),
    currency: currency || "LKR",
  });

  const payment = existingPayment || new Payment({
    appointmentId,
    patientId: appointment.patientId,
    doctorId: appointment.doctorId,
  });

  payment.amount = Number(amount);
  payment.currency = String(currency || "LKR").toUpperCase();
  payment.provider = "stripe";
  payment.paymentStatus = "pending";
  payment.checkoutSessionId = session.id;
  payment.checkoutUrl = session.url || "";
  payment.providerPaymentIntentId = session.payment_intent
    ? String(session.payment_intent)
    : "";
  payment.failureReason = "";

  await payment.save();
  await updateAppointmentPaymentStatus(appointmentId, "pending");

  return payment;
};

export const getPaymentById = async (paymentId, requester) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    const error = new Error("Payment not found");
    error.statusCode = 404;
    throw error;
  }

  assertPaymentOwnership(payment, requester);
  return payment;
};

export const getPaymentByAppointmentId = async (appointmentId, requester) => {
  const payment = await Payment.findOne({ appointmentId });
  if (!payment) {
    const error = new Error("Payment not found");
    error.statusCode = 404;
    throw error;
  }

  assertPaymentOwnership(payment, requester);
  return payment;
};

export const getPayments = async (requester) => {
  if (!requester) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    throw error;
  }

  if (requester.role === "admin") {
    return Payment.find({}).sort({ createdAt: -1 });
  }

  if (requester.role !== "patient") {
    const error = new Error("Only patients or admins can view payments");
    error.statusCode = 403;
    throw error;
  }

  return Payment.find({ patientId: requester.id }).sort({ createdAt: -1 });
};

export const handleStripeWebhookEvent = async (event) => {
  const eventType = event?.type || "";
  const session = event?.data?.object;

  if (!session?.id) {
    return null;
  }

  const payment = await Payment.findOne({ checkoutSessionId: session.id });
  if (!payment) {
    return null;
  }

  switch (eventType) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      return syncPaymentStatus(payment, "success", {
        providerPaymentIntentId: session.payment_intent,
      });

    case "checkout.session.async_payment_failed":
    case "checkout.session.expired":
      return syncPaymentStatus(payment, "failed", {
        failureReason:
          session.payment_status === "unpaid"
            ? "Stripe checkout session was not paid"
            : "Stripe checkout session failed",
        providerPaymentIntentId: session.payment_intent,
      });

    default:
      return null;
  }
};

export const verifyPaymentBySession = async (sessionId, requester) => {
  assertPatientRequester(requester);

  if (!sessionId) {
    const error = new Error("sessionId is required");
    error.statusCode = 400;
    throw error;
  }

  const payment = await Payment.findOne({ checkoutSessionId: sessionId });
  if (!payment) {
    const error = new Error("Payment not found for this session");
    error.statusCode = 404;
    throw error;
  }

  assertPaymentOwnership(payment, requester);

  if (payment.paymentStatus === "success") {
    return payment;
  }

  const session = await retrieveCheckoutSession(sessionId);

  if (session.payment_status === "paid") {
    return syncPaymentStatus(payment, "success", {
      providerPaymentIntentId: session.payment_intent,
    });
  } else if (session.status === "expired" || session.status === "canceled" || session.status === "cancelled") {
    return syncPaymentStatus(payment, "failed", {
      failureReason: `Stripe checkout session ${session.status}`,
      providerPaymentIntentId: session.payment_intent,
    });
  }

  return payment;
};
