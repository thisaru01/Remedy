import express from "express";

export const createPatientRoutes = ({ protect, proxyTo, services }) => {
  const router = express.Router();

  router.use(
    "/api/patient-profiles/me",
    protect,
    proxyTo(services.patient, {
      addUserContext: true,
      basePath: "/api/patient-profiles/me",
    }),
  );

  return router;
};
