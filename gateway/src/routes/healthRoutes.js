import express from "express";

export const createHealthRoutes = () => {
  const router = express.Router();

  router.get("/api/health", (req, res) => {
    res.status(200).json({ message: "Gateway is running" });
  });

  return router;
};
