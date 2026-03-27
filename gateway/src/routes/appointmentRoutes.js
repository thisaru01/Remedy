import express from "express";

export const createAppointmentRoutes = ({ protect, proxyTo, services }) => {
  const router = express.Router();

  router.use(
    "/api/appointments",
    protect,
    proxyTo(services.appointment, {
      addUserContext: true,
      basePath: "/api/appointments",
    }),
  );

  return router;
};
