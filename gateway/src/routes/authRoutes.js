import express from "express";

import { authorizeRoles } from "../middleware/protect.js";

export const createAuthRoutes = ({ protect, proxyTo, services }) => {
  const router = express.Router();

  // Admin-only auth endpoints
  router.use(
    "/api/auth/users",
    protect,
    authorizeRoles("admin"),
    proxyTo(services.auth, {
      addUserContext: false,
      basePath: "/api/auth/users",
    }),
  );

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
