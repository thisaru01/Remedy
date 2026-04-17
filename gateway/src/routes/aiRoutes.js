import express from "express";

import { authorizeRoles } from "../middleware/protect.js";

export const createAiRoutes = ({ protect, proxyTo, services }) => {
  const router = express.Router();

  if (!services.ai) {
    return router;
  }

  // Patients can call the AI symptom checker
  router.post(
    "/api/ai/symptom-check",
    protect,
    authorizeRoles("patient"),
    proxyTo(services.ai, {
      addUserContext: true,
      basePath: "/api/ai/symptom-check",
      // Gemini responses can take longer; allow up to 20 seconds
      timeoutMs: 20000,
    }),
  );

  // Patients can fetch their previous AI assessments
  router.get(
    "/api/ai/symptom-check/history",
    protect,
    authorizeRoles("patient"),
    proxyTo(services.ai, {
      addUserContext: true,
      basePath: "/api/ai/symptom-check",
      timeoutMs: 8000,
    }),
  );

  return router;
};
