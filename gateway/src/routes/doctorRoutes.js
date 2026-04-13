import express from "express";

import { authorizeRoles } from "../middleware/protect.js";

export const createDoctorRoutes = ({ protect, proxyTo, services }) => {
  const router = express.Router();

  router.get(
    "/api/doctor-profiles",
    protect,
    authorizeRoles("admin"),
    proxyTo(services.doctor, {
      addUserContext: true,
      basePath: "/api/doctor-profiles",
    }),
  );

  router.patch(
    "/api/doctor-profiles/:id/verification/approve",
    protect,
    authorizeRoles("admin"),
    proxyTo(services.doctor, {
      addUserContext: true,
      basePath: "/api/doctor-profiles",
    }),
  );

  router.patch(
    "/api/doctor-profiles/:id/verification/reject",
    protect,
    authorizeRoles("admin"),
    proxyTo(services.doctor, {
      addUserContext: true,
      basePath: "/api/doctor-profiles",
    }),
  );

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

  router.use(
    "/api/doctor-prescriptions",
    protect,
    proxyTo(services.doctor, {
      addUserContext: true,
      basePath: "/api/doctor-prescriptions",
    }),
  );

  return router;
};
