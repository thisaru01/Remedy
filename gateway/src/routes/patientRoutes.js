import express from "express";

import { authorizeRoles } from "../middleware/protect.js";

export const createPatientRoutes = ({ protect, proxyTo, services }) => {
  const router = express.Router();

  router.use("/api/patient-profiles", protect);

  router.use(
    "/api/patient-profiles/me",
    authorizeRoles("patient"),
    proxyTo(services.patient, {
      addUserContext: true,
      basePath: "/api/patient-profiles",
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

  return router;
};
