import express from "express";
import cors from "cors";
import morgan from "morgan";

import { createProtectMiddleware } from "./middleware/protect.js";
import { createProxyTo } from "./proxy/proxyTo.js";

export const createGatewayApp = (config) => {
  const app = express();

  app.use(cors());
  app.use(morgan("dev"));

  app.get("/api/health", (req, res) => {
    res.status(200).json({ message: "Gateway is running" });
  });

  const protect = createProtectMiddleware(config.jwtSecret);
  const proxyTo = createProxyTo({
    internalServiceToken: config.internalServiceToken,
  });

  // Public auth endpoints (no JWT required)
  app.use(
    "/api/auth",
    proxyTo(config.services.auth, {
      addUserContext: false,
      basePath: "/api/auth",
    }),
  );

  // Protected service routes (JWT required)
  app.use(
    "/api/patient-profiles/me",
    protect,
    proxyTo(config.services.patient, {
      addUserContext: true,
      basePath: "/api/patient-profiles/me",
    }),
  );

  app.use(
    "/api/doctor-profiles/me",
    protect,
    proxyTo(config.services.doctor, {
      addUserContext: true,
      basePath: "/api/doctor-profiles/me",
    }),
  );

  app.use(
    "/api/appointments",
    protect,
    proxyTo(config.services.appointment, {
      addUserContext: true,
      basePath: "/api/appointments",
    }),
  );

  app.use(
    "/api/telemedicine",
    protect,
    proxyTo(config.services.telemedicine, {
      addUserContext: true,
      basePath: "/api/telemedicine",
    }),
  );

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: "Not found",
    });
  });

  return app;
};
