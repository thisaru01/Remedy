import express from "express";

import { authorizeRoles } from "../middleware/protect.js";

export const createPatientRoutes = ({ protect, proxyTo, services }) => {
  const router = express.Router();

  router.use("/api/patient-profiles", protect);
  router.use("/api/patient-reports", protect);

  router.use(
    "/api/patient-profiles/me",
    authorizeRoles("patient"),
    proxyTo(services.patient, {
      addUserContext: true,
      basePath: "/api/patient-profiles/me",
    }),
  );

  router.get(
    "/api/patient-profiles/:id",
    authorizeRoles("doctor", "admin"),
    proxyTo(services.patient, {
      addUserContext: true,
      basePath: "/api/patient-profiles",
    }),
  );

  router.use(
    "/api/patient-reports",
    authorizeRoles("patient"),
    proxyTo(services.patient, {
      addUserContext: true,
      basePath: "/api/patient-reports",
    }),
  );

  return router;
};
