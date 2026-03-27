export const canAccessSession = (session, user) => {
  return (
    session.patientId === user.id ||
    session.doctorId === user.id ||
    user.role === "admin"
  );
};

export const canCreateSessionForDoctor = (user, doctorId) => {
  return user.role === "doctor" && user.id === doctorId;
};

export const canUpdateSessionStatus = (user, session) => {
  if (user.role === "admin") {
    return true;
  }

  if (user.role !== "doctor") {
    return false;
  }

  return session.doctorId === user.id;
};

export const canViewPatientSessions = (user, patientId) => {
  return user.role === "admin" || (user.role === "patient" && user.id === patientId);
};

export const canViewDoctorSessions = (user, doctorId) => {
  return user.role === "admin" || (user.role === "doctor" && user.id === doctorId);
};

export const canViewAllSessions = (user) => {
  return user.role === "admin";
};
