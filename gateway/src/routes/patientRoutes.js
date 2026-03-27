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

  router.use(
    "/api/patient-profiles/:id",
    protect,
    (req, res, next) => {
      const role = req.user?.role;
      if (role !== "doctor" && role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
      return next();
    },
    proxyTo(services.patient, {
      addUserContext: true,
      basePath: "/api/patient-profiles",
    }),
  );

  return router;
};
