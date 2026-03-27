import express from "express";

export const createDoctorRoutes = ({ protect, proxyTo, services }) => {
  const router = express.Router();

  router.use(
    "/api/doctor-profiles/me",
    protect,
    proxyTo(services.doctor, {
      addUserContext: true,
      basePath: "/api/doctor-profiles/me",
    }),
  );

  return router;
};
