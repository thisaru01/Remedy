import express from "express";

export const createAuthRoutes = ({ proxyTo, services }) => {
  const router = express.Router();

  // Public auth endpoints (no JWT required)
  router.use(
    "/api/auth",
    proxyTo(services.auth, {
      addUserContext: false,
      basePath: "/api/auth",
    }),
  );

  return router;
};
