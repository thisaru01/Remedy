const requireEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is required`);
  }
  return value;
};

export const loadConfig = () => {
  return {
    port: process.env.PORT || 8080,
    jwtSecret: requireEnv("JWT_SECRET"),
    internalServiceToken: requireEnv("INTERNAL_SERVICE_TOKEN"),
    services: {
      auth: requireEnv("AUTH_SERVICE_URL"),
      patient: requireEnv("PATIENT_SERVICE_URL"),
      doctor: requireEnv("DOCTOR_SERVICE_URL"),
      appointment: requireEnv("APPOINTMENT_SERVICE_URL"),
      telemedicine: requireEnv("TELEMEDICINE_SERVICE_URL"),
    },
  };
};
