import express from "express";
import { notificationController } from "../controllers/notificationController.js";

const router = express.Router();

router.post(
  "/email/appointment-confirmation",
  notificationController.sendAppointmentEmail,
);

export default router;
