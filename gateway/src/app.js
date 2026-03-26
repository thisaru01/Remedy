import express from "express";
import cors from "cors";
import morgan from "morgan";

import { createProtectMiddleware } from "./middleware/protect.js";
import { createProxyTo } from "./proxy/proxyTo.js";
import { createGatewayRoutes } from "./routes/index.js";

export const createGatewayApp = (config) => {
  const app = express();

  app.use(cors());
  app.use(morgan("dev"));

  const protect = createProtectMiddleware(config.jwtSecret);
  const proxyTo = createProxyTo({
    internalServiceToken: config.internalServiceToken,
  });

  app.use(
    createGatewayRoutes({
      protect,
      proxyTo,
      services: config.services,
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
