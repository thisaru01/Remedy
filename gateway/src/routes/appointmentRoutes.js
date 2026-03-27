import express from "express";

import { authorizeRoles } from "../middleware/protect.js";

export const createAppointmentRoutes = ({ protect, proxyTo, services }) => {
  const router = express.Router();

  // Protect all appointment routes
  router.use("/api/appointments", protect);

  // Only patients can create appointments
  router.post(
    "/api/appointments",
    authorizeRoles("patient"),
    proxyTo(services.appointment, {
      addUserContext: true,
      basePath: "/api/appointments",
    }),
  );

  // Other appointment routes (any authenticated user)
  router.use(
    "/api/appointments",
    proxyTo(services.appointment, {
      addUserContext: true,
      basePath: "/api/appointments",
    }),
  );

  return router;
};
