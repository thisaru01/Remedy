import express from "express";

import { createHealthRoutes } from "./healthRoutes.js";
import { createAuthRoutes } from "./authRoutes.js";
import { createPatientRoutes } from "./patientRoutes.js";
import { createDoctorRoutes } from "./doctorRoutes.js";
import { createAppointmentRoutes } from "./appointmentRoutes.js";
import { createTelemedicineRoutes } from "./telemedicineRoutes.js";

export const createGatewayRoutes = ({ protect, proxyTo, services }) => {
  const router = express.Router();

  router.use(createHealthRoutes());
  router.use(createAuthRoutes({ protect, proxyTo, services }));
  router.use(createPatientRoutes({ protect, proxyTo, services }));
  router.use(createDoctorRoutes({ protect, proxyTo, services }));
  router.use(createAppointmentRoutes({ protect, proxyTo, services }));
  router.use(createTelemedicineRoutes({ protect, proxyTo, services }));

  return router;
};
