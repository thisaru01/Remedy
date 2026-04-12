import * as paymentService from "../services/paymentService.js";

const handleKnownError = (res, error) => {
  if (!error.statusCode) {
    return false;
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
  });
  return true;
};

export const createPayment = async (req, res, next) => {
  try {
    const payment = await paymentService.createPayment(req.body, req.user);

    return res.status(201).json({
      success: true,
      payment,
    });
  } catch (error) {
    if (handleKnownError(res, error)) {
      return;
    }
    return next(error);
  }
};

export const getPayments = async (req, res, next) => {
  try {
    const payments = await paymentService.getPayments(req.user);

    return res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    if (handleKnownError(res, error)) {
      return;
    }
    return next(error);
  }
};

export const getPaymentById = async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id, req.user);

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    if (handleKnownError(res, error)) {
      return;
    }
    return next(error);
  }
};

export const getPaymentByAppointmentId = async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentByAppointmentId(
      req.params.appointmentId,
      req.user,
    );

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    if (handleKnownError(res, error)) {
      return;
    }
    return next(error);
  }
};
