import axios from "@/api/axios";

export const createPayment = ({ appointmentId, currency }) => {
  return axios.post("/payments", { appointmentId, currency });
};

export const verifyPayment = (sessionId) => {
  return axios.get(`/payments/verify?session_id=${sessionId}`);
};

export const getPayments = () => {
  // For admins: returns all payments. For patients: returns only their own payments.
  return axios.get("/payments");
};
