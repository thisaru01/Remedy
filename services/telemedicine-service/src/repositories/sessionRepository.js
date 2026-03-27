import Session from "../models/sessionModel.js";

export const createSessionRecord = async (payload) => {
  return Session.create(payload);
};

export const findSessionById = async (sessionId) => {
  return Session.findById(sessionId);
};

export const findSessionByAppointmentId = async (appointmentId) => {
  return Session.findOne({ appointmentId });
};

export const listSessions = async ({ filter, sort, skip, limit }) => {
  return Session.find(filter).sort(sort).skip(skip).limit(limit);
};

export const countSessions = async (filter) => {
  return Session.countDocuments(filter);
};
