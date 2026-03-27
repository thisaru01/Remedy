import express from "express";

export const createDoctorRoutes = ({ protect, proxyTo, services }) => {
  const router = express.Router();

  router.use(
    "/api/doctor-profiles/verified",
    protect,
    proxyTo(services.doctor, {
      addUserContext: true,
      basePath: "/api/doctor-profiles/verified",
    }),
  );

  router.use(
    "/api/doctor-profiles/me",
    protect,
    proxyTo(services.doctor, {
      addUserContext: true,
      basePath: "/api/doctor-profiles/me",
    }),
  );

  router.use(
    "/api/doctor-schedules",
    protect,
    proxyTo(services.doctor, {
      addUserContext: true,
      basePath: "/api/doctor-schedules",
    }),
  );

  return router;
};
