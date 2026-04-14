import axios from "@/api/axios";

export const createPayment = (data) => {
  return axios.post("/payments", data);
};

export const verifyPayment = (sessionId) => {
  return axios.get(`/payments/verify?session_id=${sessionId}`);
};
