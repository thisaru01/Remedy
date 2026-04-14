import axios from "@/api/axios";

export const loginUser = (data) => {
  return axios.post("/auth/login", data);
};

export const registerUser = (data) => {
  return axios.post("/auth/register", data);
};

export const changeMyPassword = (data) => {
  return axios.put("/auth/me/password", data);
};
