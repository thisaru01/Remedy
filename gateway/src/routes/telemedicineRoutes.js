import express from "express";

export const createTelemedicineRoutes = ({ protect, proxyTo, services }) => {
  const router = express.Router();

  router.use(
    "/api/telemedicine",
    protect,
    proxyTo(services.telemedicine, {
      addUserContext: true,
      basePath: "/api/telemedicine",
    }),
  );

  return router;
};
