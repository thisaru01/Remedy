import express from "express";

export const createPaymentRoutes = ({ protect, proxyTo, services }) => {
  const router = express.Router();

  router.use(
    "/api/payments",
    protect,
    proxyTo(services.payment, {
      addUserContext: true,
      basePath: "/api/payments",
    }),
  );

  return router;
};
